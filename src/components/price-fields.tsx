"use client";

import { currencySymbol } from "@/lib/format";
import { PRICE_LABEL, type PriceKind } from "@/lib/pricing";
import { inputCls } from "./ui";

export type PriceRange = { min: string; max: string };
export type PriceValues = Record<PriceKind, PriceRange>;
export const EMPTY_PRICES: PriceValues = { video: { min: "", max: "" }, sale: { min: "", max: "" }, views: { min: "", max: "" } };

const digits = (v: string) => v.replace(/[^\d]/g, "");

/**
 * Min / max boxes for each way of being paid that applies: budget per video,
 * price per sale, price per 1,000 views. Nothing else: no presets, no sliders.
 */
export function PriceFields({
  kinds,
  value,
  onChange,
  currency,
  errors = {},
  labels = {},
}: {
  kinds: PriceKind[];
  value: PriceValues;
  onChange: (kind: PriceKind, range: PriceRange) => void;
  currency: string;
  errors?: Partial<Record<PriceKind, string>>;
  labels?: Partial<Record<PriceKind, string>>;
}) {
  const sym = currencySymbol(currency);
  return (
    <div className="space-y-4">
      {kinds.map((k) => {
        const label = labels[k] ?? PRICE_LABEL[k];
        const v = value[k];
        return (
          <div key={k}>
            <p className="mb-1.5 text-[13px] font-medium">{label} ({sym})</p>
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="sr-only">{label}, minimum</span>
                <input inputMode="numeric" className={inputCls} placeholder="Min" value={v.min} onChange={(e) => onChange(k, { ...v, min: digits(e.target.value) })} aria-invalid={!!errors[k]} />
              </label>
              <label>
                <span className="sr-only">{label}, maximum</span>
                <input inputMode="numeric" className={inputCls} placeholder="Max" value={v.max} onChange={(e) => onChange(k, { ...v, max: digits(e.target.value) })} aria-invalid={!!errors[k]} />
              </label>
            </div>
            {errors[k] && <p role="alert" className="mt-1 text-[12px] text-danger">{errors[k]}</p>}
          </div>
        );
      })}
    </div>
  );
}
