import { BadgeCheck, Dumbbell, Mountain, ShoppingBag, Sparkles } from "lucide-react";
import type { Tone } from "@/lib/sample-data";
import { initials } from "@/lib/format";

export const TONES: Record<Tone, { bg: string; fg: string; soft: string }> = {
  rose: { bg: "from-rose-200 via-pink-100 to-orange-100", fg: "text-rose-500", soft: "bg-rose-50 text-rose-600" },
  mint: { bg: "from-emerald-200 via-teal-100 to-lime-100", fg: "text-emerald-600", soft: "bg-emerald-50 text-emerald-700" },
  violet: { bg: "from-violet-200 via-fuchsia-100 to-pink-100", fg: "text-violet-500", soft: "bg-violet-50 text-violet-600" },
  amber: { bg: "from-amber-200 via-yellow-100 to-orange-50", fg: "text-amber-500", soft: "bg-amber-50 text-amber-700" },
  sky: { bg: "from-sky-200 via-cyan-100 to-teal-50", fg: "text-sky-600", soft: "bg-sky-50 text-sky-700" },
  lime: { bg: "from-lime-200 via-emerald-100 to-teal-50", fg: "text-lime-600", soft: "bg-lime-50 text-lime-700" },
};

const SIZES = { xs: "h-7 w-7 text-[10px]", sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" };

export function Avatar({
  name,
  tone = "mint",
  size = "sm",
  ring = false,
  square = false,
}: {
  name: string;
  tone?: Tone;
  size?: keyof typeof SIZES;
  ring?: boolean;
  square?: boolean;
}) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center bg-gradient-to-br font-semibold ${TONES[tone].bg} ${TONES[tone].fg} ${SIZES[size]} ${square ? "rounded-xl" : "rounded-full"} ${ring ? "ring-2 ring-white outline-2 outline-offset-1 outline-brand-400" : ""}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function VerifiedMark() {
  return <BadgeCheck className="h-4 w-4 fill-sky-500 text-white" aria-label="Verified" />;
}

const MEDIA = { bottle: Sparkles, mountain: Mountain, dumbbell: Dumbbell, bag: ShoppingBag };

/** Illustrative media placeholder for sample posts (no stock or real photos). */
export function MediaArt({ tone, media, label }: { tone: Tone; media: keyof typeof MEDIA; label?: string }) {
  const Icon = MEDIA[media];
  return (
    <div className={`relative grid aspect-[4/3] w-full place-items-center overflow-hidden bg-gradient-to-br ${TONES[tone].bg}`} role="img" aria-label={label ?? "Post media"}>
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
      <div className="absolute -bottom-12 -right-6 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
      <div className="relative grid h-24 w-24 place-items-center rounded-[2rem] bg-white/60 shadow-lg backdrop-blur">
        <Icon className={`h-11 w-11 ${TONES[tone].fg}`} strokeWidth={1.6} />
      </div>
    </div>
  );
}
