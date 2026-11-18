"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Briefcase, Check, Megaphone, Plus, Trash2 } from "lucide-react";
import { Avatar, VerifiedMark } from "./art";
import { DealFields, budgetText, checkDeal, emptyDeal, type DealDraft } from "./deal-form";
import { useFeedback } from "./feedback";
import { Button, EmptyState, Field, SampleTag, Sheet, inputCls } from "./ui";
import { NICHES, deliverablesText, earningLabel } from "@/lib/catalog";
import { timeAgo, uid } from "@/lib/format";
import { SAMPLE_OPPORTUNITIES, profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";
import type { Opportunity } from "@/lib/types";

export function useOpportunities() {
  const { opportunities } = useStore();
  return useMemo(() => [...opportunities, ...SAMPLE_OPPORTUNITIES].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [opportunities]);
}

function PostOpportunity({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session, update } = useStore();
  const { toast } = useFeedback();
  const [title, setTitle] = useState("");
  const [niches, setNiches] = useState<string[]>(session?.lookingFor ?? []);
  const [draft, setDraft] = useState<DealDraft>(emptyDeal());
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = checkDeal(draft);
    const errs = { ...r.errors };
    if (title.trim().length < 4) errs.title = "Give it a short title (at least 4 characters).";
    setErrors(errs);
    if (Object.keys(errs).length || !r.offer || !session) return;
    const opp: Opportunity = { id: uid("opp"), ownerHandle: session.handle, title: title.trim(), type: r.offer.type, niches, budgetMin: r.offer.budgetMin, budgetMax: r.offer.budgetMax, deliverables: r.offer.deliverables, details: r.offer.note, createdAt: new Date().toISOString() };
    update((s) => ({ ...s, opportunities: [opp, ...s.opportunities] }));
    toast("Opportunity posted! Creators can apply now 🚀");
    setTitle("");
    setDraft(emptyDeal());
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Post an opportunity">
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Title" error={errors.title}>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="e.g. Summer skincare launch" aria-invalid={!!errors.title} />
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Creator types you want</p>
          <div className="flex flex-wrap gap-1.5">
            {NICHES.map((n) => {
              const on = niches.includes(n);
              return (
                <button key={n} type="button" aria-pressed={on} onClick={() => setNiches((x) => (on ? x.filter((y) => y !== n) : [...x, n]))} className={`press h-9 rounded-full px-3 text-[13px] font-semibold ${on ? "bg-aurora text-on-accent" : "border border-line"}`}>
                  {n}
                </button>
              );
            })}
          </div>
        </div>
        <DealFields draft={draft} onChange={setDraft} errors={errors} noteLabel="Details" />
        <div className="sticky bottom-0 -mx-5 grid grid-cols-2 gap-2 border-t border-line bg-surface px-5 py-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit"><Megaphone className="h-4 w-4" /> Post</Button>
        </div>
      </form>
    </Sheet>
  );
}

export function OpportunityCard({ o }: { o: Opportunity }) {
  const { session, oppApplied, toggle, update } = useStore();
  const { startThread, send } = useThreads();
  const { toast, confirm } = useFeedback();
  const router = useRouter();
  const owner = profileByHandle(o.ownerHandle);
  const mine = o.ownerHandle === session?.handle;
  const applied = oppApplied.includes(o.id);
  const name = mine ? session!.displayName : owner?.name ?? o.ownerHandle;

  function apply() {
    if (applied) return;
    const id = startThread(o.ownerHandle, o.type);
    send(id, { body: `Hi! I'd love to apply for “${o.title}”. My rates and work are on my profile. 🙌`, deal: { type: o.type, budgetMin: o.budgetMin, budgetMax: o.budgetMax, deliverables: o.deliverables, note: "" } });
    toggle("oppApplied", o.id);
    toast("Applied! Your application is in Messages.");
    router.push(`/inbox/${id}`);
  }

  async function remove() {
    if (!(await confirm({ title: "Delete this opportunity?", confirmLabel: "Delete", danger: true }))) return;
    update((s) => ({ ...s, opportunities: s.opportunities.filter((x) => x.id !== o.id) }));
    toast("Opportunity deleted", "info");
  }

  return (
    <article className="card overflow-hidden" aria-label={o.title}>
      <div className="bg-aurora h-1.5" />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Link href={mine ? "/profile" : `/u/${o.ownerHandle}`}><Avatar name={name} tone={owner?.tone ?? "violet"} square /></Link>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[13px] text-muted">
              <span className="truncate font-semibold text-ink">{name}</span> {owner?.verified && <VerifiedMark />} · {timeAgo(o.createdAt)}
            </p>
            <h3 className="mt-0.5 text-[17px] font-bold leading-snug">{o.title}</h3>
          </div>
          {o.sample && <SampleTag />}
          {mine && <button onClick={remove} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Delete opportunity"><Trash2 className="h-4 w-4" /></button>}
        </div>
        <p className="mt-2 text-[14px]">{o.details}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
          <span className="bg-aurora rounded-full px-2.5 py-1 font-bold text-on-accent">{earningLabel(o.type)}</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">{budgetText(o.budgetMin, o.budgetMax)}</span>
          {o.deliverables.length > 0 && <span className="rounded-full bg-elevated px-2.5 py-1 font-semibold ring-1 ring-line">{deliverablesText(o.deliverables)}</span>}
          {o.niches.map((n) => <span key={n} className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">{n}</span>)}
        </div>
        {session?.role === "creator" && !mine && (
          <Button className="mt-4 w-full" onClick={apply} disabled={applied} variant={applied ? "secondary" : "primary"}>
            {applied ? <><Check className="h-4 w-4" /> Applied</> : "Apply now"}
          </Button>
        )}
      </div>
    </article>
  );
}

export function OpportunityList() {
  const { session } = useStore();
  const all = useOpportunities();
  const [posting, setPosting] = useState(false);
  const isBiz = session?.role === "business";
  const mineFirst = isBiz ? [...all.filter((o) => o.ownerHandle === session?.handle), ...all.filter((o) => o.ownerHandle !== session?.handle)] : all;

  return (
    <div>
      {isBiz ? (
        <button onClick={() => setPosting(true)} className="press bg-aurora btn-glow mb-4 flex w-full items-center gap-3 rounded-[var(--radius-card)] p-4 text-left text-on-accent">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20"><Plus className="h-6 w-6" /></span>
          <span>
            <span className="block font-bold">Post an opportunity</span>
            <span className="block text-[13px] text-on-accent/75">Tell creators what you need. Applications land in your Messages.</span>
          </span>
        </button>
      ) : (
        <p className="bg-aurora-soft mb-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-[13px]"><Briefcase className="h-4 w-4 text-brand-600" /> Brands post paid work here. Tap <strong>Apply now</strong> and we send your application to their Messages.</p>
      )}
      {mineFirst.length ? (
        <ul className="stagger space-y-4">
          {mineFirst.map((o, i) => <li key={o.id} style={{ ["--i" as string]: Math.min(i, 6) }}><OpportunityCard o={o} /></li>)}
        </ul>
      ) : (
        <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No opportunities yet" body="New paid work from brands will appear here." />
      )}
      {isBiz && <PostOpportunity open={posting} onClose={() => setPosting(false)} />}
    </div>
  );
}
