import { BadgeCheck, Dumbbell, Headphones, Lamp, Mountain, ShoppingBag, Soup, Sparkles } from "lucide-react";
import type { Tone } from "@/lib/sample-data";
import { initials } from "@/lib/format";

export const TONES: Record<Tone, { bg: string; fg: string; soft: string }> = {
  rose: { bg: "from-rose-100 to-rose-50", fg: "text-rose-700", soft: "bg-rose-50 text-rose-600" },
  mint: { bg: "from-emerald-50 to-teal-50", fg: "text-emerald-700", soft: "bg-emerald-50 text-emerald-700" },
  violet: { bg: "from-violet-100 to-violet-50", fg: "text-violet-700", soft: "bg-violet-50 text-violet-600" },
  amber: { bg: "from-amber-50 to-orange-50", fg: "text-amber-700", soft: "bg-amber-50 text-amber-700" },
  sky: { bg: "from-sky-50 to-cyan-100", fg: "text-sky-700", soft: "bg-sky-50 text-sky-700" },
  lime: { bg: "from-lime-100 to-lime-50", fg: "text-lime-700", soft: "bg-lime-50 text-lime-700" },
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
      className={`inline-grid shrink-0 place-items-center bg-gradient-to-br font-medium ring-1 ring-inset ring-ink/5 ${TONES[tone].bg} ${TONES[tone].fg} ${SIZES[size]} ${square ? "rounded-xl" : "rounded-full"} ${ring ? "ring-2 ring-surface outline-2 outline-offset-1 outline-brand-400" : ""}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function VerifiedMark() {
  return <BadgeCheck className="h-4 w-4 shrink-0 fill-brand-600 text-canvas" aria-label="Verified" />;
}

const MEDIA = { bottle: Sparkles, mountain: Mountain, dumbbell: Dumbbell, bag: ShoppingBag, lamp: Lamp, headphones: Headphones, bowl: Soup };
export type MediaKind = keyof typeof MEDIA;

/**
 * Curated photographic previews for fictional SAMPLE posts only.
 * Images are public Unsplash photo CDN assets, used as editorial inspiration.
 * Real user uploads continue through the existing post-media pipeline.
 * When an image is unavailable, the branded icon/gradient remain visible.
 */
const SAMPLE_PHOTOS: Record<MediaKind, string> = {
  bottle: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200&q=80&auto=format&fit=crop",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop",
  dumbbell: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80&auto=format&fit=crop",
  bag: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80&auto=format&fit=crop",
  lamp: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format&fit=crop",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop",
  bowl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80&auto=format&fit=crop",
};

/** Editorial imagery for demo content; gradient + icon provide offline fallback. */
export function MediaArt({ tone, media, label }: { tone: Tone; media: MediaKind; label?: string }) {
  const Icon = MEDIA[media];
  return (
    <div
      className={`group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br ${TONES[tone].bg}`}
      role="img"
      aria-label={label ?? "Sample editorial photograph"}
    >
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.035]" style={{ backgroundImage: `url("${SAMPLE_PHOTOS[media]}")` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <div className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-xl border border-white/40 bg-white/75 text-ink shadow-sm backdrop-blur-sm">
        <Icon className="h-4 w-4" strokeWidth={1.7} />
      </div>
    </div>
  );
}
