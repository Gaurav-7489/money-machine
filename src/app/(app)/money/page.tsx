"use client";

import { TabIndicator } from "@/components/motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BadgeCheck, CreditCard, Handshake, Link2, Megaphone, Package, PlusCircle, Rocket, ShoppingCart, Sparkles, Trash2, TrendingDown, TrendingUp, Video, Wallet } from "lucide-react";
import { useFeedback } from "@/components/feedback";
import { Button, EmptyState, Field, PageHeader, Sheet, inputCls, selectCls } from "@/components/ui";
import { formatDate, formatINR, uid } from "@/lib/format";
import { useGrowth, useMoney } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import type { FinancialRecord } from "@/lib/types";
import { fieldErrors, financialRecordInput, type FieldErrors } from "@/lib/validation";

type Kind = FinancialRecord["kind"];

const CATS: Record<Kind, readonly (readonly [string, string])[]> = {
  income: [["brand_deal", "Brand deal"], ["affiliate", "Affiliate"], ["ugc", "UGC"], ["campaign", "Campaign"], ["other", "Other"]],
  spending: [["creator_payment", "Creator payment"], ["affiliate_commission", "Affiliate commission"], ["campaign", "Campaign / ads"], ["product_seeding", "Product seeding"], ["other", "Other"]],
  revenue: [["sales", "Sales"], ["subscriptions", "Subscriptions"], ["services", "Services"], ["other", "Other"]],
};
const CAT_ICON: Record<string, typeof Wallet> = { brand_deal: Handshake, affiliate: Link2, affiliate_commission: Link2, ugc: Video, campaign: Megaphone, creator_payment: Handshake, product_seeding: Package, sales: ShoppingCart, subscriptions: CreditCard, services: Sparkles, other: Wallet };
const LABEL: Record<Kind, { one: string; add: string; from: string; ph: string }> = {
  income: { one: "Earning", add: "Add earning", from: "From (optional)", ph: "e.g. Glow Habit collab" },
  spending: { one: "Investment", add: "Add investment", from: "Paid to (optional)", ph: "e.g. Reel with @kavya.fit" },
  revenue: { one: "Revenue", add: "Add revenue", from: "Source (optional)", ph: "e.g. Website sales, November" },
};

function Bars({ values, tone = "bg-aurora" }: { values: number[]; tone?: string }) {
  const max = Math.max(...values.map(Math.abs), 1);
  return (
    <div className="flex h-14 items-end gap-1.5" aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} className={`w-3 rounded-full ${v < 0 ? "bg-rose-400" : i === values.length - 1 ? tone : "bg-white/35"}`} style={{ height: `${Math.max(10, (Math.abs(v) / max) * 100)}%` }} />
      ))}
    </div>
  );
}

function RecordForm({ kind, open, onClose }: { kind: Kind; open: boolean; onClose: () => void }) {
  const { update } = useStore();
  const { toast } = useFeedback();
  const cats = CATS[kind];
  const empty = { title: "", amount: "", category: cats[0]![0], date: new Date().toISOString().slice(0, 10), counterparty: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => setForm((f) => ({ ...f, category: CATS[kind][0]![0] })), [kind]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = financialRecordInput.safeParse({ ...form, kind, counterparty: form.counterparty || undefined });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    const rec: FinancialRecord = { id: uid("rec"), ...parsed.data, category: parsed.data.category as FinancialRecord["category"], source: "self_reported", createdAt: new Date().toISOString() };
    update((s) => ({ ...s, records: [rec, ...s.records] }));
    setForm(empty);
    setErrors({});
    toast(`${LABEL[kind].one} added`);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={LABEL[kind].add}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Description" error={errors.title}>
          <input className={inputCls} value={form.title} onChange={set("title")} aria-invalid={!!errors.title} placeholder={LABEL[kind].ph} />
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
          <select className={selectCls} value={form.category} onChange={set("category")}>
            {cats.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label={LABEL[kind].from}>
          <input className={inputCls} value={form.counterparty} onChange={set("counterparty")} />
        </Field>
        <Button type="submit" className="w-full">Save</Button>
      </form>
    </Sheet>
  );
}

function RecordList({ kind }: { kind: Kind }) {
  const { records, update } = useStore();
  const { toast, confirm } = useFeedback();
  const list = records.filter((r) => r.kind === kind).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  async function remove(id: string) {
    if (!(await confirm({ title: "Delete this record?", body: "It will be removed from your totals. This can't be undone.", confirmLabel: "Delete", danger: true }))) return;
    update((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }));
    toast("Record deleted", "info");
  }
  if (!list.length)
    return (
      <div className="card">
        <EmptyState
          icon={<Wallet className="h-5 w-5" />}
          title={kind === "income" ? "No income recorded yet" : kind === "spending" ? "No investments yet" : "No revenue yet"}
          body={kind === "income" ? "Log brand deals, affiliate payouts and UGC payments, or connect Stripe to track real payouts." : kind === "spending" ? "Log creator payments, commissions and campaigns: this is money you invest to grow." : "Connect Stripe or log sales to see the return on what you invest."}
        />
      </div>
    );
  const sign = kind === "spending" ? "−" : "+";
  return (
    <ul className="card divide-y divide-line">
      {list.map((r) => {
        const Icon = CAT_ICON[r.category] ?? Wallet;
        return (
          <li key={r.id} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-elevated text-ink"><Icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{r.title}</span>
              <span className="block text-xs text-muted">{formatDate(r.date)}{r.counterparty ? ` · ${r.counterparty}` : ""} · {r.source === "verified" ? "Verified" : "Self-reported"}</span>
            </span>
            <span className={`text-sm font-bold tabular-nums ${kind === "spending" ? "text-ink" : "text-emerald-600"}`}>{sign}{formatINR(r.amount)}</span>
            <button onClick={() => remove(r.id)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${r.title}`}><Trash2 className="h-4 w-4" /></button>
          </li>
        );
      })}
    </ul>
  );
}

function StripeCard({ purpose }: { purpose: "payouts" | "revenue" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="press card flex w-full items-center gap-3 p-4 text-left hover:border-brand-300">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#635bff] text-white"><CreditCard className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">Connect Stripe</span>
          <span className="block text-[13px] text-muted">{purpose === "payouts" ? "Show real, verified earnings from your payouts." : "Import real revenue and payments to measure scaling."}</span>
        </span>
        <span className="rounded-full bg-elevated px-2.5 py-1 text-[11px] font-bold text-muted ring-1 ring-line">Soon</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Connect Stripe">
        <div className="space-y-3 text-[15px]">
          <p>Once accounts go live, you&apos;ll connect your Stripe account in one tap. Money Machine will then read your {purpose === "payouts" ? "payouts" : "payments and revenue"} (read-only) and mark them as <strong>Verified</strong>.</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li>• We never see your card or bank details.</li>
            <li>• You can disconnect any time.</li>
            <li>• Until then, add records by hand. They&apos;re marked self-reported.</li>
          </ul>
          <Button className="w-full" onClick={() => setOpen(false)}>Got it</Button>
        </div>
      </Sheet>
    </>
  );
}

/** Creators: real earnings. */
function CreatorEarnings() {
  const { summary, records } = useMoney();
  const [open, setOpen] = useState(false);
  const bySource = CATS.income.map(([id, label]) => ({ id, label, total: records.filter((r) => r.category === id).reduce((s, r) => s + r.amount, 0) })).filter((x) => x.total > 0);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Earnings" back="/profile" />
      <section className="bg-money relative overflow-hidden rounded-[var(--radius-card)] p-5 text-on-accent shadow-lg">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-on-accent/75">Total earned</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight">{formatINR(summary.total)}</p>
            <p className="mt-1.5 text-xs">
              {summary.changePercent !== null ? (
                <span className="rounded-full bg-white/20 px-2 py-0.5 font-bold">{summary.changePercent >= 0 ? "▲" : "▼"} {Math.abs(summary.changePercent)}% vs last month</span>
              ) : (
                <span className="text-on-accent/75">This month: {formatINR(summary.thisMonth)}</span>
              )}
            </p>
          </div>
          <Bars values={summary.monthly.map((m) => m.total)} tone="bg-white" />
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-white/25 pt-3 text-sm">
          <div><p className="flex items-center gap-1 text-xs text-on-accent/75"><BadgeCheck className="h-3.5 w-3.5" /> Verified</p><p className="font-bold">{formatINR(summary.verifiedTotal)}</p></div>
          <div><p className="text-xs text-on-accent/75">Self-reported</p><p className="font-bold">{formatINR(summary.selfReportedTotal)}</p></div>
        </div>
      </section>

      {bySource.length > 0 && (
        <section className="card mt-4 p-4">
          <h2 className="mb-3 text-sm font-bold">Where your money comes from</h2>
          <ul className="space-y-2.5">
            {bySource.map((s) => (
              <li key={s.id}>
                <div className="mb-1 flex justify-between text-[13px]"><span className="font-medium">{s.label}</span><span className="font-bold tabular-nums">{formatINR(s.total)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-elevated"><div className="bg-aurora h-full rounded-full" style={{ width: `${Math.max(4, (s.total / summary.total) * 100)}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-4"><StripeCard purpose="payouts" /></div>
      <section className="mt-4">
        <RecordList kind="income" />
        <Button variant="secondary" className="mt-4 w-full" onClick={() => setOpen(true)}><PlusCircle className="h-4 w-4" /> Add earning</Button>
      </section>
      <RecordForm kind="income" open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/** Businesses: invest (spending) and scale (revenue), with profit front and centre. */
function BusinessGrowth() {
  const params = useSearchParams();
  const g = useGrowth();
  const [tab, setTab] = useState<"spending" | "revenue">("spending");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (params.get("add") === "1") setOpen(true);
  }, [params]);
  const up = g.profit >= 0;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Grow & Scale" back="/profile" />
      <section className="bg-aurora relative overflow-hidden rounded-[var(--radius-card)] p-5 text-on-accent shadow-lg">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-on-accent/75"><Rocket className="h-4 w-4" /> Profit</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight">{up ? "" : "−"}{formatINR(Math.abs(g.profit))}</p>
            <p className="mt-1.5 text-xs">
              {g.roi !== null ? <span className="rounded-full bg-white/20 px-2 py-0.5 font-bold">{g.roi >= 0 ? "▲" : "▼"} {Math.abs(g.roi)}% return on investment</span> : <span className="text-on-accent/75">Add investments and revenue to see your return.</span>}
            </p>
          </div>
          <Bars values={g.monthlyProfit.map((m) => m.total)} tone="bg-white" />
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-white/25 pt-3 text-sm">
          <div><p className="flex items-center gap-1 text-xs text-on-accent/75"><TrendingDown className="h-3.5 w-3.5" /> Invested</p><p className="font-bold">{formatINR(g.spending.total)}</p></div>
          <div><p className="flex items-center gap-1 text-xs text-on-accent/75"><TrendingUp className="h-3.5 w-3.5" /> Revenue</p><p className="font-bold">{formatINR(g.revenue.total)}</p></div>
        </div>
      </section>

      <div role="tablist" aria-label="Show" className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 ring-1 ring-line">
        {([["spending", "Invest", TrendingDown], ["revenue", "Scaling", TrendingUp]] as const).map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`press relative isolate flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-bold ${tab === id ? "text-surface" : "text-muted"}`}>
            {tab === id && <TabIndicator group="money" variant="pill" />}
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {tab === "revenue" && <StripeCard purpose="revenue" />}
        <RecordList kind={tab} />
        <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}><PlusCircle className="h-4 w-4" /> {LABEL[tab].add}</Button>
      </div>
      <RecordForm kind={tab} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function MoneyInner() {
  const { session } = useStore();
  return session?.role === "business" ? <BusinessGrowth /> : <CreatorEarnings />;
}

export default function Money() {
  return (
    <Suspense>
      <MoneyInner />
    </Suspense>
  );
}
