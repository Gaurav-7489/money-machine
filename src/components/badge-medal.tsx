import { ChartNoAxesColumn, Flame, Lock, Rocket, Shield, Sparkles, Star, Trophy, Users, Wallet } from "lucide-react";
import type { BadgeIcon } from "@/lib/badges";

const ICONS: Record<BadgeIcon, typeof Star> = {
  star: Star,
  sparkles: Sparkles,
  trophy: Trophy,
  flame: Flame,
  shield: Shield,
  chart: ChartNoAxesColumn,
  rocket: Rocket,
  users: Users,
  wallet: Wallet,
};

/** Badges are coins: earned ones are struck in marigold, locked ones are an engraved outline. */
export function BadgeMedal({ icon, earned, size = "md" }: { icon: BadgeIcon; earned: boolean; size?: "md" | "lg" }) {
  const Icon = ICONS[icon];
  const dims = size === "lg" ? "h-28 w-28" : "h-14 w-14";
  const glyph = size === "lg" ? "h-10 w-10" : "h-6 w-6";
  const teeth = Array.from({ length: 48 }, (_, i) => i);
  return (
    <span className={`relative grid ${dims} shrink-0 place-items-center`}>
      <svg viewBox="0 0 100 100" className={`absolute inset-0 h-full w-full ${earned ? "" : "opacity-70"}`} aria-hidden="true">
        <circle cx="50" cy="50" r="48" className={earned ? "fill-signal" : "fill-transparent stroke-line"} strokeWidth="1.5" />
        {/* milled rim */}
        {teeth.map((i) => (
          <line key={i} x1="50" y1="4" x2="50" y2="9" transform={`rotate(${i * 7.5} 50 50)`} className={earned ? "stroke-on-signal/35" : "stroke-line"} strokeWidth="1.2" />
        ))}
        <circle cx="50" cy="50" r="37" fill="none" className={earned ? "stroke-on-signal/40" : "stroke-line"} strokeWidth="1" strokeDasharray={earned ? "0" : "2 3"} />
      </svg>
      <Icon className={`relative ${glyph} ${earned ? "text-on-signal" : "text-muted"}`} strokeWidth={1.8} />
      {!earned && (
        <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border border-line bg-canvas text-muted">
          <Lock className="h-3 w-3" />
        </span>
      )}
    </span>
  );
}
