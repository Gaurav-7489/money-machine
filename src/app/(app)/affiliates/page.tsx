"use client";

import Link from "next/link";
import { useState } from "react";
import { Inbox, Link2, Plus, Receipt } from "lucide-react";
import { Avatar } from "@/components/art";
import { Button, ButtonLink, DeviceNote, EmptyState, Field, PageHeader, SampleTag, Sheet, StatusPill, Toast, inputCls } from "@/components/ui";
import { formatDate, uid } from "@/lib/format";
import { useMyPrograms, usePrograms } from "@/lib/hooks";
import { profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { applicationInput, fieldErrors, type FieldErrors } from "@/lib/validation";
import type { AffiliateProgram, ApplicationStatus, ProgramStatus } from "@/lib/types";

function ProgramRow({ p, right }: { p: AffiliateProgram; right: React.ReactNode }) {
  return (
    <li id={p.id} className="card scroll-mt-24 p-4">
      <div className="flex items-start gap-3">
        <Avatar name={p.brand} tone={profileByHandle(p.ownerHandle)?.tone ?? "violet"} size="md" square />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            {p.name} {p.sample && <SampleTag />}
          </p>
          <p className="text-sm font-medium text-brand-700">{p.commissionPercent}% Commission</p>
          <p className="mt-1 text-sm text-muted">{p.description}</p>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-[13px] font-medium text-ink">Terms</summary>
            <p className="mt-1 whitespace-pre-wrap text-muted">{p.terms}</p>
          </details>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">{right}</div>
      </div>
    </li>
  );
}

function CommissionRecords() {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold text-muted">Commission records</h2>
      <div className="card">
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title="No commission records yet"
          body="Commissions appear here only when a brand confirms a sale through your program. Nothing is estimated."
        />
      </div>
    </section>
  );
}

function CreatorView() {
  const [tab, setTab] = useState<"mine" | "discover">("mine");
  const mine = useMyPrograms();
  const programs = usePrograms().filter((p) => p.status === "active");
  const { session, applications, update } = useStore();
  const [applyTo, setApplyTo] = useState<AffiliateProgram | null>(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<string | null>(null);

  const myApp = (programId: string) => applications.find((a) => a.programId === programId && a.creatorHandle === session!.handle && a.status !== "withdrawn");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const parsed = applicationInput.safeParse({ message });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    update((s) => ({
      ...s,
      applications: [...s.applications, { id: uid("app"), programId: applyTo!.id, creatorHandle: session!.handle, message: parsed.data.message, status: "pending", createdAt: new Date().toISOString() }],
    }));
    setApplyTo(null);
    setMessage("");
    setErrors({});
    setToast("Application sent");
  }

  function withdraw(programId: string) {
    update((s) => ({
      ...s,
      applications: s.applications.map((a) => (a.programId === programId && a.creatorHandle === session!.handle ? { ...a, status: "withdrawn" as ApplicationStatus } : a)),
    }));
  }

  return (
    <>
      <Tabs tabs={[["mine", "My Programs"], ["discover", "Discover"]]} value={tab} onChange={(v) => setTab(v as typeof tab)} />
      {tab === "mine" &&
        (mine.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Link2 className="h-5 w-5" />}
              title="You haven't joined a program yet"
              body="Browse affiliate programs from brands and apply to the ones that fit your audience."
              action={<Button size="sm" onClick={() => setTab("discover")}>Discover programs</Button>}
            />
          </div>
        ) : (
          <ul className="space-y-3">
            {mine.map(({ program, status }) => (
              <ProgramRow
                key={program.id}
                p={program}
                right={
                  <>
                    <StatusPill status={status} />
                    {status === "pending" && (
                      <button onClick={() => withdraw(program.id)} className="text-xs font-medium text-muted hover:text-rose-600">Withdraw</button>
                    )}
                  </>
                }
              />
            ))}
          </ul>
        ))}
      {tab === "discover" && (
        <ul className="space-y-3">
          {programs.map((p) => {
            const a = myApp(p.id);
            return (
              <ProgramRow
                key={p.id}
                p={p}
                right={a ? <StatusPill status={a.status} /> : <Button size="sm" onClick={() => setApplyTo(p)}>Apply</Button>}
              />
            );
          })}
        </ul>
      )}
      <CommissionRecords />

      <Sheet open={!!applyTo} onClose={() => setApplyTo(null)} title={`Apply to ${applyTo?.name ?? ""}`}>
        <form onSubmit={apply} className="space-y-4" noValidate>
          <Field label="Message to the brand" error={errors.message} hint="Your niche, audience and why this fits.">
            <textarea className={`${inputCls} min-h-28`} value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!errors.message} />
          </Field>
          {applyTo?.sample && <DeviceNote>This is a sample program, so your application will stay pending.</DeviceNote>}
          <Button type="submit" className="w-full">Send application</Button>
        </form>
      </Sheet>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}

function BusinessView() {
  const [tab, setTab] = useState<"mine" | "applications">("mine");
  const { session, programs, applications, update } = useStore();
  const mine = programs.filter((p) => p.ownerHandle === session!.handle);
  const ids = new Set(mine.map((p) => p.id));
  const apps = applications.filter((a) => ids.has(a.programId) && a.status !== "withdrawn");
  const pending = apps.filter((a) => a.status === "pending").length;

  const setStatus = (id: string, status: ProgramStatus) => update((s) => ({ ...s, programs: s.programs.map((p) => (p.id === id ? { ...p, status } : p)) }));
  const decide = (id: string, status: ApplicationStatus) => update((s) => ({ ...s, applications: s.applications.map((a) => (a.id === id ? { ...a, status } : a)) }));

  return (
    <>
      <Tabs tabs={[["mine", "My Programs"], ["applications", `Applications${pending ? ` (${pending})` : ""}`]]} value={tab} onChange={(v) => setTab(v as typeof tab)} />
      {tab === "mine" &&
        (mine.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Link2 className="h-5 w-5" />}
              title="No affiliate programs yet"
              body="Create a program with your commission and terms. Creators can then discover and apply."
              action={<ButtonLink href="/affiliates/new" size="sm"><Plus className="h-4 w-4" /> Create Program</ButtonLink>}
            />
          </div>
        ) : (
          <ul className="space-y-3">
            {mine.map((p) => {
              const count = apps.filter((a) => a.programId === p.id && a.status === "approved").length;
              return (
                <ProgramRow
                  key={p.id}
                  p={p}
                  right={
                    <>
                      <StatusPill status={p.status} />
                      <span className="text-xs text-muted">{count} affiliate{count === 1 ? "" : "s"}</span>
                      {p.status === "active" ? (
                        <button onClick={() => setStatus(p.id, "paused")} className="text-xs font-medium text-muted hover:text-ink">Pause</button>
                      ) : (
                        <button onClick={() => setStatus(p.id, "active")} className="text-xs font-medium text-brand-700">Activate</button>
                      )}
                    </>
                  }
                />
              );
            })}
          </ul>
        ))}
      {tab === "applications" &&
        (apps.length === 0 ? (
          <div className="card">
            <EmptyState icon={<Inbox className="h-5 w-5" />} title="No applications yet" body="When creators apply to your programs, you'll review them here." />
          </div>
        ) : (
          <ul className="space-y-3">
            {apps.map((a) => (
              <li key={a.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={a.creatorHandle} tone="rose" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">@{a.creatorHandle}</p>
                    <p className="text-xs text-muted">{mine.find((p) => p.id === a.programId)?.name} · {formatDate(a.createdAt.slice(0, 10))}</p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
                <p className="mt-2 text-sm text-muted">{a.message}</p>
                {a.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => decide(a.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="secondary" onClick={() => decide(a.id, "rejected")}>Decline</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ))}
      {tab === "mine" && mine.length > 0 && (
        <ButtonLink href="/affiliates/new" variant="secondary" className="mt-4 w-full"><Plus className="h-4 w-4" /> Create Program</ButtonLink>
      )}
    </>
  );
}

function Tabs({ tabs, value, onChange }: { tabs: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="tablist" className="mb-4 inline-flex rounded-full bg-white p-1 ring-1 ring-line">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`h-8 rounded-full px-4 text-[13px] font-semibold transition ${value === id ? "bg-brand-600 text-white" : "text-muted hover:text-ink"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function Affiliates() {
  const { session } = useStore();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Affiliate Program" back="/profile" action={session?.role === "business" ? <Link href="/affiliates/new" className="text-sm font-semibold text-brand-700">New</Link> : undefined} />
      {session?.role === "business" ? <BusinessView /> : <CreatorView />}
    </div>
  );
}
