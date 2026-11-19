"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";

const MONTH = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" });
const label = (ym: string) => MONTH.format(new Date(`${ym}-01T00:00:00Z`));

/**
 * Six-month bar chart for money. Bars grow from the baseline once; the current
 * month is marigold, earlier months ink, losses brick below the baseline.
 * Hover or focus a month to read its exact value. The figures are also given
 * as a visually hidden table for screen readers.
 */
export function MonthChart({ data, caption, currency }: { data: { month: string; total: number }[]; caption: string; currency?: string }) {
  const money = (v: number) => formatMoney(v, currency);
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => Math.abs(d.total)), 1);
  const hasNeg = data.some((d) => d.total < 0);
  const shown = active ?? data.length - 1;
  const cur = data[shown];
  return (
    <figure className="w-full">
      <div className="mb-4 flex items-baseline justify-between text-[13px]" aria-hidden="true">
        <span className="text-muted">{cur ? `${label(cur.month)}` : ""}</span>
        <span className={`font-semibold tabular-nums ${cur && cur.total < 0 ? "text-loss" : ""}`}>{cur ? `${cur.total < 0 ? "−" : ""}${money(Math.abs(cur.total))}` : ""}</span>
      </div>
      <div className={`relative grid h-40 grid-cols-6 gap-2 sm:gap-3 ${hasNeg ? "items-center" : "items-end"}`} onPointerLeave={() => setActive(null)} aria-hidden="true">
        {/* baseline */}
        <span className={`absolute inset-x-0 h-px bg-ink/70 ${hasNeg ? "top-1/2" : "bottom-0"}`} />
        {data.map((d, i) => {
          const h = Math.max(d.total === 0 ? 2 : 6, (Math.abs(d.total) / max) * (hasNeg ? 50 : 100));
          const last = i === data.length - 1;
          const neg = d.total < 0;
          return (
            <button
              key={d.month}
              type="button"
              tabIndex={-1}
              onPointerEnter={() => setActive(i)}
              className={`relative flex h-full flex-col ${hasNeg ? "justify-center" : "justify-end"}`}
            >
              <span
                className={`grow-y block w-full rounded-t-[4px] transition-opacity duration-300 ${neg ? "bg-loss" : last ? "bg-signal" : "bg-ink"} ${active !== null && active !== i ? "opacity-35" : ""} ${hasNeg ? (neg ? "translate-y-1/2 rounded-b-[4px] rounded-t-none" : "-translate-y-1/2") : ""}`}
                style={{ height: `${h}%`, ["--i" as string]: i, transformOrigin: neg ? "top" : "bottom" }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-6 gap-2 text-center text-[12px] text-muted sm:gap-3" aria-hidden="true">
        {data.map((d, i) => <span key={d.month} className={i === shown ? "font-medium text-ink" : ""}>{label(d.month)}</span>)}
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}><th scope="row">{label(d.month)}</th><td>{d.total < 0 ? "−" : ""}{money(Math.abs(d.total))}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
