"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BadgeCheck, Handshake, Link2, Megaphone, Package, PlusCircle, Trash2, Video, Wallet } from "lucide-react";
import { Button, DeviceNote, EmptyState, Field, PageHeader, Sheet, Toast, inputCls } from "@/components/ui";
import { formatDate, formatINR, uid } from "@/lib/format";
import { useMoney } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { fieldErrors, financialRecordInput, type FieldErrors } from "@/lib/validation";
import type { FinancialRecord } from "@/lib/types";

const INCOME_CATS = [
  ["brand_deal", "Brand deal"],
  ["affiliate", "Affiliate"],
  ["ugc", "UGC"],
  ["campaign", "Campaign"],
  ["other", "Other"],
] as const;
const SPEND_CATS = [
  ["creator_payment", "Creator payment"],
  ["affiliate_commission", "Affiliate commission"],
  ["campaign", "Campaign"],
  ["product_seeding", "Product seeding"],
  ["other", "Other"],
] as const;

const CAT_ICON: Record<string, typeof Wallet> = {
  brand_deal: Handshake,
  affiliate: Link2,
  affiliate_commission: Link2,
  ugc: Video,
  campaign: Megaphone,
  creator_payment: Handshake,
  product_seeding: Package,
  other: Wallet,
};

function Bars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} className={`w-2.5 rounded-full ${i === values.length - 1 ? "bg-brand-500" : "bg-brand-200"}`} style={{ height: `${Math.max(8, (v / max) * 100)}%` }} />
      ))}
    </div>
  );
}

function MoneyInner() {
  const { kind, summary, records } = useMoney();
  const { update } = useStore();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cats = kind === "income" ? INCOME_CATS : SPEND_CATS;
  const empty = { title: "", amount: "", category: cats[0][0] as string, date: new Date().toISOString().slice(0, 10), counterparty: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (params.get("add") === "1") setOpen(true);
  }, [params]);

  const label = kind === "income" ? "Income" : "Spending";
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = financialRecordInput.safeParse({ ...form, kind, counterparty: form.counterparty || undefined });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    const rec: FinancialRecord = {
      id: uid("rec"),
      ...parsed.data,
      category: parsed.data.category as FinancialRecord["category"],
      source: "self_reported",
      createdAt: new Date().toISOString(),
    };
    update((s) => ({ ...s, records: [rec, ...s.records] }));
    setOpen(false);
    setForm(empty);
    setErrors({});
    setToast(`${label} added`);
  }

  function remove(id: string) {
    if (!window.confirm("Delete this record?")) return;
    update((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }));
    setToast("Record deleted");
  }

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Money" back="/profile" />
      <div className="mb-4 inline-flex rounded-full bg-white p-1 ring-1 ring-line">
        <span className="rounded-full bg-brand-600 px-4 py-1.5 text-[13px] font-semibold text-white">
          {kind === "income" ? "Income (Creator)" : "Spending (Business)"}
        </span>
      </div>

      <section className="card p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Total {label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{formatINR(summary.total)}</p>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted">
              {summary.changePercent !== null ? (
                <span className={`rounded-full px-1.5 py-0.5 font-semibold ${summary.changePercent >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {summary.changePercent >= 0 ? "+" : ""}
                  {summary.changePercent}% vs last month
                </span>
              ) : (
                <span>This month: {formatINR(summary.thisMonth)}</span>
              )}
            </p>
          </div>
          <Bars values={summary.monthly.map((m) => m.total)} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
          <div>
            <p className="text-xs text-muted">Self-reported</p>
            <p className="font-semibold">{formatINR(summary.selfReportedTotal)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted"><BadgeCheck className="h-3.5 w-3.5 text-brand-600" /> Verified</p>
            <p className="font-semibold">{formatINR(summary.verifiedTotal)}</p>
          </div>
        </div>
      </section>

      <section className="mt-4">
        {sorted.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Wallet className="h-5 w-5" />}
              title={`No ${label.toLowerCase()} recorded yet`}
              body={kind === "income" ? "Log brand deals, affiliate payouts and UGC payments to see your growth." : "Log creator payments, commissions and campaign costs to track your budget."}
            />
          </div>
        ) : (
          <ul className="card divide-y divide-line">
            {sorted.map((r) => {
              const Icon = CAT_ICON[r.category] ?? Wallet;
              return (
                <li key={r.id} className="group flex items-center gap-3 px-4 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-canvas text-ink"><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{r.title}</span>
                    <span className="block text-xs text-muted">
                      {formatDate(r.date)}
                      {r.counterparty ? ` · ${r.counterparty}` : ""} · {r.source === "verified" ? "Verified" : "Self-reported"}
                    </span>
                  </span>
                  <span className={`text-sm font-semibold ${kind === "income" ? "text-emerald-700" : "text-ink"}`}>
                    {kind === "income" ? "+" : "−"}
                    {formatINR(r.amount)}
                  </span>
                  <button onClick={() => remove(r.id)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${r.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Button variant="secondary" className="mt-4 w-full" onClick={() => setOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Add {label}
        </Button>
        <p className="mt-3 text-center text-xs text-muted">Your financial records are private to your account. Entries you add are marked self-reported.</p>
      </section>

      <Sheet open={open} onClose={() => setOpen(false)} title={`Add ${label}`}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Description" error={errors.title}>
            <input className={inputCls} value={form.title} onChange={set("title")} aria-invalid={!!errors.title} placeholder={kind === "income" ? "e.g. Glow Habit collab" : "e.g. Creator payment — reel"} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)" error={errors.amount}>
              <input className={inputCls} inputMode="numeric" value={form.amount} onChange={set("amount")} aria-invalid={!!errors.amount} />
            </Field>
            <Field label="Date" error={errors.date}>
              <input type="date" className={inputCls} value={form.date} onChange={set("date")} max={new Date().toISOString().slice(0, 10)} aria-invalid={!!errors.date} />
            </Field>
          </div>
          <Field label="Category">
            <select className={inputCls} value={form.category} onChange={set("category")}>
              {cats.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label={kind === "income" ? "From (optional)" : "Paid to (optional)"}>
            <input className={inputCls} value={form.counterparty} onChange={set("counterparty")} />
          </Field>
          <DeviceNote>Saved on this device as a self-reported record. Verified records will come from confirmed platform payments.</DeviceNote>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </Sheet>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}

export default function Money() {
  return (
    <Suspense>
      <MoneyInner />
    </Suspense>
  );
}
