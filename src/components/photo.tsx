import { Camera, Heart, Music, ShoppingBag, Sparkles, Star, type LucideIcon } from "lucide-react";
import type { Photo as PhotoT } from "@/lib/photos";

/**
 * Placeholder art in the original Money Machine style: a soft pastel gradient
 * with a frosted white tile and an icon. Stands in for demo/sample imagery
 * (no stock photography). Fills its positioned parent; the parent sets the
 * aspect ratio and radius. The same photo id always gets the same art.
 */
const ART: { bg: string; fg: string; icon: LucideIcon }[] = [
  { bg: "from-rose-200 via-pink-100 to-orange-100", fg: "text-rose-500", icon: Sparkles },
  { bg: "from-emerald-200 via-teal-100 to-lime-100", fg: "text-emerald-600", icon: Heart },
  { bg: "from-violet-200 via-fuchsia-100 to-pink-100", fg: "text-violet-500", icon: Star },
  { bg: "from-amber-200 via-yellow-100 to-orange-50", fg: "text-amber-500", icon: ShoppingBag },
  { bg: "from-sky-200 via-cyan-100 to-teal-50", fg: "text-sky-600", icon: Camera },
  { bg: "from-lime-200 via-emerald-100 to-teal-50", fg: "text-lime-600", icon: Music },
];

function pick(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ART[h % ART.length]!;
}

export function Photo({
  photo,
  className = "",
  decorative = false,
}: {
  photo: PhotoT;
  /** kept for call-site compatibility */
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** true when nearby text already says what the image shows */
  decorative?: boolean;
}) {
  const a = pick(photo.id);
  const Icon = a.icon;
  return (
    <span
      className={`absolute inset-0 grid place-items-center overflow-hidden bg-gradient-to-br ${a.bg} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : photo.alt}
      aria-hidden={decorative ? true : undefined}
    >
      <span className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
      <span className="absolute -bottom-12 -right-6 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
      <span className="relative grid h-[min(6rem,40%)] w-[min(6rem,40%)] min-h-10 min-w-10 place-items-center rounded-[30%] bg-white/60 shadow-lg backdrop-blur">
        <Icon className={`h-1/2 w-1/2 ${a.fg}`} strokeWidth={1.6} />
      </span>
    </span>
  );
}
