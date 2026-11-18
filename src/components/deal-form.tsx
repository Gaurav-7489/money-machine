"use client";

import { Minus, Plus, X } from "lucide-react";
import { DELIVERABLE_TYPES, EARNING_MODELS, deliverablesText, earningLabel, type Deliverable } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import type { DealOffer } from "@/lib/types";
import { Field, inputCls, selectCls } from "./ui";

export interface DealDraft {
  type: string;
  budgetMin: string;
  budgetMax: string;
  deliverables: Deliverable[];
  note: string;
}

export const emptyDeal = (type = "brand_deal"): DealDraft => ({
  type,
  budgetMin: "",
  budgetMax: "",
  deliverables: [
    { count: 2, type: "Reels" },
    { count: 3, type: "Photos" },
  ],
  note: "",
});

const n = (v: string) => (v.trim() === "" ? undefined : Number(v));

/** Validates a draft. Returns an error message per field, or the offer. */
export function checkDeal(d: DealDraft, { noteRequired = true } = {}): { errors: Record<string, string>; offer?: DealOffer } {
  const errors: Record<string, string> = {};
  const lo = n(d.budgetMin);
  const hi = n(d.budgetMax);
  if (lo !== undefined && hi !== undefined && lo > hi) errors.budget = "The minimum should be smaller than the maximum.";
  if (noteRequired && d.note.trim().length < 5) errors.note = "Write a short message (at least 5 characters).";
  if (d.note.length > 1000) errors.note = "Keep the message under 1000 characters.";
  const deliverables = d.deliverables.filter((x) => x.count > 0);
  if (Object.keys(errors).length) return { errors };
  return { errors, offer: { type: d.type, budgetMin: lo, budgetMax: hi, deliverables, note: d.note.trim() } };
}

export function budgetText(min?: number, max?: number): string {
  if (min === undefined && max === undefined) return "Budget open";
  if (min !== undefined && max !== undefined) return min === max ? formatINR(min) : `${formatINR(min)} – ${formatINR(max)}`;
  return min !== undefined ? `From ${formatINR(min)}` : `Up to ${formatINR(max!)}`;
}

/** The fields of a deal: type, budget range, deliverables and a note. */
export function DealFields({ draft, onChange, errors, noteLabel = "Note / message" }: { draft: DealDraft; onChange: (d: DealDraft) => void; errors: Record<string, string>; noteLabel?: string }) {
  const set = <K extends keyof DealDraft>(k: K, v: DealDraft[K]) => onChange({ ...draft, [k]: v });
  const used = new Set(draft.deliverables.map((d) => d.type));
  const nextType = DELIVERABLE_TYPES.find((t) => !used.has(t));

  return (
    <div className="space-y-4">
      <Field label="Type">
        <select className={selectCls} value={draft.type} onChange={(e) => set("type", e.target.value)}>
          {EARNING_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </Field>

      <div>
        <p className="mb-1.5 text-[13px] font-medium">Budget (₹) — min to max</p>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="sr-only">Minimum budget in rupees</span>
            <input inputMode="numeric" className={inputCls} placeholder="Min e.g. 5000" value={draft.budgetMin} onChange={(e) => set("budgetMin", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!errors.budget} />
          </label>
          <label>
            <span className="sr-only">Maximum budget in rupees</span>
            <input inputMode="numeric" className={inputCls} placeholder="Max e.g. 20000" value={draft.budgetMax} onChange={(e) => set("budgetMax", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!errors.budget} />
          </label>
        </div>
        {errors.budget && <p role="alert" className="mt-1 text-[12px] text-rose-600">{errors.budget}</p>}
      </div>

      <div>
        <p className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium">
          Deliverables <span className="text-[12px] font-normal text-muted">{deliverablesText(draft.deliverables) || "None yet"}</span>
        </p>
        <ul className="space-y-2">
          {draft.deliverables.map((d, i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="flex items-center rounded-full border border-line">
                <button type="button" onClick={() => set("deliverables", draft.deliverables.map((x, j) => (j === i ? { ...x, count: Math.max(0, x.count - 1) } : x)))} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-elevated" aria-label={`Fewer ${d.type}`}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{d.count}</span>
                <button type="button" onClick={() => set("deliverables", draft.deliverables.map((x, j) => (j === i ? { ...x, count: Math.min(30, x.count + 1) } : x)))} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-elevated" aria-label={`More ${d.type}`}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <label className="min-w-0 flex-1">
                <span className="sr-only">Deliverable type</span>
                <select className={selectCls} value={d.type} onChange={(e) => set("deliverables", draft.deliverables.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)))}>
                  {DELIVERABLE_TYPES.filter((t) => t === d.type || !used.has(t)).map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => set("deliverables", draft.deliverables.filter((_, j) => j !== i))} className="press grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${d.type}`}>
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        {nextType && (
          <button type="button" onClick={() => set("deliverables", [...draft.deliverables, { count: 1, type: nextType }])} className="press mt-2 inline-flex h-9 items-center gap-1 rounded-full bg-brand-50 px-3 text-[13px] font-semibold text-brand-700 hover:bg-brand-100">
            <Plus className="h-4 w-4" /> Add deliverable
          </button>
        )}
      </div>

      <Field label={noteLabel} error={errors.note} hint={`${draft.note.length}/1000`}>
        <textarea className={`${inputCls} min-h-24`} maxLength={1000} value={draft.note} onChange={(e) => set("note", e.target.value)} aria-invalid={!!errors.note} placeholder="Hi! We love your content and would like to work together…" />
      </Field>
    </div>
  );
}

/** Read-only summary of a deal offer (used in messages and the bulk DM review step). */
export function DealSummary({ deal, compact = false }: { deal: DealOffer; compact?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-2xl ring-1 ring-brand-200 ${compact ? "" : "bg-surface"}`}>
      <div className="bg-aurora flex items-center justify-between px-3.5 py-2 text-on-accent">
        <span className="text-[13px] font-bold">{earningLabel(deal.type)}</span>
        <span className="text-[12px] font-semibold opacity-90">Deal offer</span>
      </div>
      <dl className="grid grid-cols-2 gap-2 px-3.5 py-3 text-[13px]">
        <div>
          <dt className="text-[11px] text-muted">Budget</dt>
          <dd className="font-semibold">{budgetText(deal.budgetMin, deal.budgetMax)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">Deliverables</dt>
          <dd className="font-semibold">{deliverablesText(deal.deliverables) || "To discuss"}</dd>
        </div>
      </dl>
      {deal.note && !compact && <p className="whitespace-pre-wrap border-t border-line px-3.5 py-2.5 text-[14px]">{deal.note}</p>}
    </div>
  );
}
