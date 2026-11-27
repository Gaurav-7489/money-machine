/**
 * A creator and a business owner shaking hands, with a "+$" popping up between
 * them. Pure SVG + CSS (see the .deal-* rules in globals.css); the app-wide
 * reduced-motion rule turns the motion off and leaves a still picture.
 */
export function DealAnimation() {
  return (
    <figure className="mx-auto w-full max-w-md">
      <svg viewBox="0 0 360 230" role="img" aria-label="A content creator and a business owner shaking hands, with a plus-dollar sign between them" className="w-full overflow-visible">
        <defs>
          <linearGradient id="deal-coin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2DE3C8" />
            <stop offset="1" stopColor="#0E7A5C" />
          </linearGradient>
        </defs>
        <ellipse cx="70" cy="214" rx="46" ry="7" className="fill-ink/10" />
        <ellipse cx="290" cy="214" rx="46" ry="7" className="fill-ink/10" />

        {/* Creator */}
        <g className="deal-left">
          <rect x="42" y="104" width="56" height="102" rx="26" fill="#f43f5e" />
          <circle cx="70" cy="70" r="28" fill="#fcd5b5" />
          <path d="M42 66c0-20 12-32 28-32s28 12 28 32c-8-10-18-14-28-14s-20 4-28 14z" fill="#3b2a24" />
          <circle cx="60" cy="74" r="2.6" fill="#3b2a24" />
          <circle cx="80" cy="74" r="2.6" fill="#3b2a24" />
          <path d="M60 85q10 8 20 0" fill="none" stroke="#3b2a24" strokeWidth="2.6" strokeLinecap="round" />
        </g>

        {/* Business owner */}
        <g className="deal-right">
          <rect x="262" y="104" width="56" height="102" rx="26" fill="#8b5cf6" />
          <path d="M290 108l-7 14 7 38 7-38z" fill="#ddd6fe" />
          <circle cx="290" cy="70" r="28" fill="#c68a62" />
          <path d="M262 62c4-18 15-26 28-26s24 8 28 26c-10-6-18-8-28-8s-18 2-28 8z" fill="#1f1a2e" />
          <circle cx="280" cy="74" r="2.6" fill="#1f1a2e" />
          <circle cx="300" cy="74" r="2.6" fill="#1f1a2e" />
          <path d="M280 85q10 8 20 0" fill="none" stroke="#1f1a2e" strokeWidth="2.6" strokeLinecap="round" />
        </g>

        {/* Arms meet in the middle and pump up and down */}
        <g className="deal-arms">
          <rect x="84" y="128" width="98" height="16" rx="8" fill="#f43f5e" />
          <rect x="178" y="128" width="98" height="16" rx="8" fill="#8b5cf6" />
          <circle cx="180" cy="136" r="13" fill="#fcd5b5" stroke="#ffffff" strokeWidth="3" />
        </g>

        {/* +$ pops up between them */}
        <g className="deal-plus">
          <circle cx="180" cy="92" r="23" fill="url(#deal-coin)" />
          <text x="180" y="99" textAnchor="middle" fontSize="20" fontWeight="800" fill="#ffffff">+$</text>
        </g>
        <text x="146" y="104" className="deal-spark fill-brand-500" fontSize="15" fontWeight="800" style={{ animationDelay: "0.3s" }}>$</text>
        <text x="206" y="100" className="deal-spark fill-brand-500" fontSize="13" fontWeight="800" style={{ animationDelay: "0.7s" }}>$</text>
        <text x="176" y="68" className="deal-spark fill-brand-500" fontSize="12" fontWeight="800" style={{ animationDelay: "1.1s" }}>$</text>
      </svg>
      <figcaption className="mt-1 flex justify-between px-6 text-[13px] font-semibold text-muted">
        <span>Creator</span>
        <span>Business owner</span>
      </figcaption>
    </figure>
  );
}
