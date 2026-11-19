import { useId } from "react";

/** Small trend line in ledger green; the line draws in once on mount. */
export function Sparkline({ values, className = "h-12 w-full" }: { values: number[]; className?: string }) {
  const id = `spark-${useId().replace(/:/g, "")}`;
  const max = Math.max(...values, 1);
  const w = 120;
  const h = 40;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const pts = values.map((v, i) => [i * step, h - 4 - (v / max) * (h - 8)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-gain)", stopOpacity: 0.22 }} />
          <stop offset="1" style={{ stopColor: "var(--color-gain)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} className="animate-fade-in" />
      <path d={d} pathLength={1} fill="none" style={{ stroke: "var(--color-gain)" }} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="line-draw" />
    </svg>
  );
}
