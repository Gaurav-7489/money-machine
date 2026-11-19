"use client";

import { BadgeMedal } from "@/components/badge-medal";
import { PageHeader } from "@/components/ui";
import { useBadges } from "@/lib/hooks";

export default function Badges() {
  const badges = useBadges();
  const earned = badges.filter((b) => b.earned);
  const featured = earned[earned.length - 1] ?? [...badges].filter((b) => !b.badge.requiresVerification).sort((a, b) => b.current / b.target - a.current / a.target)[0];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Badges" back="/profile" />
      {featured && (
        <section className="flex items-center gap-6 border-b border-line pb-8 md:gap-10">
          <span className="animate-[scale-in_0.7s_var(--ease-spring)_both]"><BadgeMedal icon={featured.badge.icon} earned={featured.earned} size="lg" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-muted">{featured.earned ? "Latest badge" : "Closest to earning"}</p>
            <p className="font-display mt-1 text-[clamp(2rem,5vw,3rem)] leading-[0.9]">{featured.badge.name}</p>
            <p className="mt-2 text-[14px] text-muted">{featured.badge.description}</p>
            {!featured.earned && (
              <div className="mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-elevated">
                <div className="h-full origin-left rounded-full bg-signal animate-[grow-x_0.9s_var(--ease-out-expo)_both]" style={{ width: `${Math.max(3, (featured.current / featured.target) * 100)}%` }} />
              </div>
            )}
          </div>
        </section>
      )}

      <h2 className="font-text mb-4 mt-8 flex items-baseline justify-between text-[14px] font-semibold">
        Your badges <span className="font-normal tabular-nums text-muted">{earned.length} of {badges.length} earned</span>
      </h2>
      <ul className="stagger grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-3">
        {badges.map(({ badge, earned: isEarned, current, target }, i) => (
          <li key={badge.id} style={{ ["--i" as string]: i }} className="flex flex-col items-center bg-canvas p-5 text-center">
            <BadgeMedal icon={badge.icon} earned={isEarned} />
            <p className="mt-3 text-[14px] font-semibold leading-tight">{badge.name}</p>
            <p className="mt-1 text-[12px] leading-snug text-muted">{badge.description}</p>
            {!isEarned &&
              (badge.requiresVerification ? (
                <p className="mt-2 text-[11px] font-medium text-muted">Needs verified records</p>
              ) : (
                <p className="mt-2 text-[12px] font-semibold tabular-nums">
                  {target >= 1000 ? `${Math.round((current / target) * 100)}%` : `${current}/${target}`}
                </p>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
