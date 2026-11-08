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
        <section className="card flex flex-col items-center bg-gradient-to-br from-cream via-white to-violet-50 p-6 text-center">
          <BadgeMedal icon={featured.badge.icon} earned={featured.earned} size="lg" />
          <p className="mt-3 text-lg font-bold">{featured.badge.name}</p>
          <p className="text-sm text-muted">{featured.earned ? `Earned · ${featured.badge.description}` : `Next up · ${featured.badge.description}`}</p>
          {!featured.earned && (
            <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white ring-1 ring-line">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${(featured.current / featured.target) * 100}%` }} />
            </div>
          )}
        </section>
      )}

      <h2 className="mb-3 mt-6 font-semibold">
        Your Badges <span className="text-sm font-normal text-muted">· {earned.length} of {badges.length} earned</span>
      </h2>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        {badges.map(({ badge, earned: isEarned, current, target }) => (
          <li key={badge.id} className="card flex flex-col items-center p-4 text-center">
            <BadgeMedal icon={badge.icon} earned={isEarned} />
            <p className="mt-2 text-[13px] font-semibold leading-tight">{badge.name}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{badge.description}</p>
            {!isEarned &&
              (badge.requiresVerification ? (
                <p className="mt-2 text-[10px] font-medium text-slate-500">Needs verified records</p>
              ) : (
                <p className="mt-2 text-[11px] font-semibold text-brand-700">
                  {target >= 1000 ? `${Math.round((current / target) * 100)}%` : `${current}/${target}`}
                </p>
              ))}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-xs text-muted">Badges are awarded automatically from your activity. Badges marked “needs verified records” unlock once platform-confirmed payments are available.</p>
    </div>
  );
}
