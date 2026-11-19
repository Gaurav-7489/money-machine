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

export function BadgeMedal({ icon, earned, size = "md" }: { icon: BadgeIcon; earned: boolean; size?: "md" | "lg" }) {
  const Icon = ICONS[icon];
  const dims = size === "lg" ? "h-20 w-20" : "h-14 w-14";
  const glyph = size === "lg" ? "h-9 w-9" : "h-6 w-6";
  return (
    <span className={`relative grid ${dims} place-items-center`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <polygon points="50,3 63,15 81,12 85,30 98,42 90,58 95,76 78,82 70,97 50,92 30,97 22,82 5,76 10,58 2,42 15,30 19,12 37,15" className={earned ? "fill-accent-soft" : "fill-elevated"} />
      </svg>
      <span className={`relative grid h-[68%] w-[68%] place-items-center rounded-full ${earned ? "bg-accent-soft text-accent ring-1 ring-accent/30" : "bg-elevated text-muted ring-1 ring-line"}`}>
        <Icon className={glyph} strokeWidth={2.2} />
      </span>
      {!earned && (
        <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-surface text-muted shadow ring-1 ring-line">
          <Lock className="h-3 w-3" />
        </span>
      )}
    </span>
  );
}
