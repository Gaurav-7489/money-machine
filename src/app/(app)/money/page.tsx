"use client";

import { TabIndicator } from "@/components/motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BadgeCheck, CreditCard, Handshake, Link2, Megaphone, Package, PlusCircle, Rocket, ShoppingCart, Sparkles, Trash2, TrendingDown, TrendingUp, Video, Wallet } from "lucide-react";
import { useFeedback } from "@/components/feedback";
import { MonthChart } from "@/components/month-chart";
import { Button, EmptyState, Field, PageHeader, Sheet, inputCls, selectCls } from "@/components/ui";
import { currencySymbol, formatDate, formatMoney, uid } from "@/lib/format";
import { useCurrency, useGrowth, useMoney } from "@/lib/hooks";
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

function RecordForm({ kind, open, onClose }: { kind: Kind; open: boolean; onClose: () => void }) {
  const { update } = useStore();
  const { toast } = useFeedback();
  const currency = useCurrency();
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
    const rec: FinancialRecord = { id: uid("rec"), ...parsed.data, category: parsed.data.category as FinancialRecord["category"], currency, source: "self_reported", createdAt: new Date().toISOString() };
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
          <Field label={`Amount (${currencySymbol(currency)})`} error={errors.amount}>
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
  const currency = useCurrency();
  const list = records.filter((r) => r.kind === kind).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  async function remove(id: string) {
    if (!(await confirm({ title: "Delete this record?", body: "It will be removed from your totals. This can't be undone.", confirmLabel: "Delete", danger: true }))) return;
    update((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }));
    toast("Record deleted", "info");
  }
  if (!list.length)
    return (
      <div className="border-y border-line">
        <EmptyState
          icon={<Wallet className="h-5 w-5" />}
          title={kind === "income" ? "No income recorded yet" : kind === "spending" ? "No investments yet" : "No revenue yet"}
          body={kind === "income" ? "Log brand deals, affiliate payouts and UGC payments, or connect Stripe to track real payouts." : kind === "spending" ? "Log creator payments, commissions and campaigns: this is money you invest to grow." : "Connect Stripe or log sales to see the return on what you invest."}
        />
      </div>
    );
  const sign = kind === "spending" ? "−" : "+";
  return (
    <ul className="divide-y divide-line border-y border-line">
      {list.map((r) => {
        const Icon = CAT_ICON[r.category] ?? Wallet;
        return (
          <li key={r.id} className="flex items-center gap-3 py-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink"><Icon className="h-4 w-4" strokeWidth={1.7} /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{r.title}</span>
              <span className="block text-xs text-muted">{formatDate(r.date)}{r.counterparty ? ` · ${r.counterparty}` : ""} · {r.source === "verified" ? "Verified" : "Self-reported"}</span>
            </span>
            <span className={`font-display text-[22px] leading-none tabular-nums ${kind === "spending" ? "text-ink" : "text-gain"}`}>{sign}{formatMoney(r.amount, r.currency ?? currency)}</span>
            <button onClick={() => remove(r.id)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-elevated hover:text-danger" aria-label={`Delete ${r.title}`}><Trash2 className="h-4 w-4" /></button>
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
      <button onClick={() => setOpen(true)} className="press flex w-full items-center gap-3 rounded-[18px] border border-dashed border-muted/50 p-4 text-left transition-colors hover:border-brand-300">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-elevated"><CreditCard className="h-5 w-5" strokeWidth={1.7} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Connect Stripe</span>
          <span className="block text-[13px] text-muted">{purpose === "payouts" ? "Show real, verified earnings from your payouts." : "Import real revenue and payments to measure scaling."}</span>
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted">Soon</span>
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
  const currency = useCurrency();
  const money = (v: number) => formatMoney(v, currency);
  const [open, setOpen] = useState(false);
  const bySource = CATS.income.map(([id, label]) => ({ id, label, total: records.filter((r) => r.category === id).reduce((s, r) => s + r.amount, 0) })).filter((x) => x.total > 0);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Earnings" back="/profile" />
      <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12" aria-label="Summary">
        <div>
          <p className="text-[14px] text-muted">Total earned</p>
          <p className="font-display mt-2 text-[clamp(2.5rem,8vw,3.75rem)] leading-[0.85] tabular-nums">{money(summary.total)}</p>
          <p className="mt-3 text-[14px]">
            {summary.changePercent !== null ? (
              <span className={`font-semibold tabular-nums ${summary.changePercent >= 0 ? "text-gain" : "text-loss"}`}>{summary.changePercent >= 0 ? "▲" : "▼"} {Math.abs(summary.changePercent)}% vs last month</span>
            ) : (
              <span className="text-muted">This month: <span className="font-medium tabular-nums text-ink">{money(summary.thisMonth)}</span></span>
            )}
          </p>
          <dl className="mt-6 grid grid-cols-2 border-y border-line text-[13px]">
            <div className="py-3"><dt className="flex items-center gap-1 text-muted"><BadgeCheck className="h-3.5 w-3.5" /> Verified</dt><dd className="mt-1 text-[17px] font-semibold tabular-nums">{money(summary.verifiedTotal)}</dd></div>
            <div className="border-l border-line py-3 pl-4"><dt className="text-muted">Self-reported</dt><dd className="mt-1 text-[17px] font-semibold tabular-nums">{money(summary.selfReportedTotal)}</dd></div>
          </dl>
        </div>
        <MonthChart currency={currency} data={summary.monthly} caption="Earnings for the last six months" />
      </section>

      {bySource.length > 0 && (
        <section className="mt-12 border-t border-line pt-3">
          <h2 className="font-text mb-4 text-[14px] font-semibold">Where your money comes from</h2>
          <ul className="space-y-4">
            {bySource.map((s, i) => (
              <li key={s.id}>
                <div className="mb-1.5 flex justify-between text-[14px]"><span>{s.label}</span><span className="font-semibold tabular-nums">{money(s.total)}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-elevated"><div className={`h-full origin-left rounded-full ${i === 0 ? "bg-signal" : "bg-primary"} animate-[grow-x_0.9s_var(--ease-out-expo)_both]`} style={{ width: `${Math.max(4, (s.total / summary.total) * 100)}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12" aria-labelledby="records-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 id="records-title" className="text-[clamp(1.4rem,3.5vw,1.85rem)]">Records</h2>
          <Button onClick={() => setOpen(true)}><PlusCircle className="h-4 w-4" /> Add earning</Button>
        </div>
        <RecordList kind="income" />
        <div className="mt-6"><StripeCard purpose="payouts" /></div>
      </section>
      <RecordForm kind="income" open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/** Businesses: invest (spending) and scale (revenue), with profit front and centre. */
function BusinessGrowth() {
  const params = useSearchParams();
  const g = useGrowth();
  const currency = useCurrency();
  const money = (v: number) => formatMoney(v, currency);
  const [tab, setTab] = useState<"spending" | "revenue">("spending");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (params.get("add") === "1") setOpen(true);
  }, [params]);
  const up = g.profit >= 0;
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Grow & Scale" back="/profile" />
      <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12" aria-label="Summary">
        <div>
          <p className="flex items-center gap-1.5 text-[14px] text-muted"><Rocket className="h-4 w-4" /> Profit</p>
          <p className={`font-display mt-2 text-[clamp(2.5rem,8vw,3.75rem)] leading-[0.85] tabular-nums ${up ? "" : "text-loss"}`}>{up ? "" : "−"}{money(Math.abs(g.profit))}</p>
          <p className="mt-3 text-[14px]">
            {g.roi !== null ? <span className={`font-semibold tabular-nums ${g.roi >= 0 ? "text-gain" : "text-loss"}`}>{g.roi >= 0 ? "▲" : "▼"} {Math.abs(g.roi)}% return on investment</span> : <span className="text-muted">Add investments and revenue to see your return.</span>}
          </p>
          <dl className="mt-6 grid grid-cols-2 border-y border-line text-[13px]">
            <div className="py-3"><dt className="flex items-center gap-1 text-muted"><TrendingDown className="h-3.5 w-3.5" /> Invested</dt><dd className="mt-1 text-[17px] font-semibold tabular-nums">{money(g.spending.total)}</dd></div>
            <div className="border-l border-line py-3 pl-4"><dt className="flex items-center gap-1 text-muted"><TrendingUp className="h-3.5 w-3.5" /> Revenue</dt><dd className="mt-1 text-[17px] font-semibold tabular-nums">{money(g.revenue.total)}</dd></div>
          </dl>
        </div>
        <MonthChart currency={currency} data={g.monthlyProfit} caption="Profit for the last six months" />
      </section>

      <div role="tablist" aria-label="Show" className="mt-12 grid grid-cols-2 gap-1 rounded-full border border-line p-1">
        {([["spending", "Invest", TrendingDown], ["revenue", "Scaling", TrendingUp]] as const).map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`press relative isolate flex h-10 items-center justify-center gap-1.5 rounded-full text-sm font-semibold ${tab === id ? "text-on-primary" : "text-muted hover:text-ink"}`}>
            {tab === id && <TabIndicator group="money" variant="pill" />}
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        <div className="flex justify-end"><Button onClick={() => setOpen(true)}><PlusCircle className="h-4 w-4" /> {LABEL[tab].add}</Button></div>
        <RecordList kind={tab} />
        {tab === "revenue" && <StripeCard purpose="revenue" />}
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
