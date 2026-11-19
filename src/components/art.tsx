import { BadgeCheck, Dumbbell, Headphones, Lamp, Mountain, ShoppingBag, Soup, Sparkles } from "lucide-react";
import type { Tone } from "@/lib/sample-data";
import { initials } from "@/lib/format";
import { NICHE_PHOTOS, STORY, type Photo as PhotoT } from "@/lib/photos";
import { Photo } from "./photo";
import { MediaImage } from "./image-slot";

export const TONES: Record<Tone, { bg: string; fg: string; soft: string }> = {
  rose: { bg: "from-tone-rose to-tone-rose", fg: "text-tone-rose-ink", soft: "bg-tone-rose text-tone-rose-ink" },
  mint: { bg: "from-tone-mint to-tone-mint", fg: "text-tone-mint-ink", soft: "bg-tone-mint text-tone-mint-ink" },
  violet: { bg: "from-tone-violet to-tone-violet", fg: "text-tone-violet-ink", soft: "bg-tone-violet text-tone-violet-ink" },
  amber: { bg: "from-tone-amber to-tone-amber", fg: "text-tone-amber-ink", soft: "bg-tone-amber text-tone-amber-ink" },
  sky: { bg: "from-tone-sky to-tone-sky", fg: "text-tone-sky-ink", soft: "bg-tone-sky text-tone-sky-ink" },
  lime: { bg: "from-tone-lime to-tone-lime", fg: "text-tone-lime-ink", soft: "bg-tone-lime text-tone-lime-ink" },
};

const SIZES = { xs: "h-7 w-7 text-[10px]", sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" };

export function Avatar({
  name,
  tone = "mint",
  size = "sm",
  ring = false,
  square = false,
  photoId,
}: {
  name: string;
  tone?: Tone;
  size?: keyof typeof SIZES;
  ring?: boolean;
  square?: boolean;
  /** on-device media id of a profile photo; initials show until it loads */
  photoId?: string;
}) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center bg-gradient-to-br font-semibold ${TONES[tone].bg} ${TONES[tone].fg} ${SIZES[size]} ${square ? "rounded-[28%]" : "rounded-full"} ${ring ? "ring-2 ring-surface outline-2 outline-offset-1 outline-ink" : ""}`}
      aria-hidden="true"
    >
      {photoId ? (
        <span className="relative block h-full w-full overflow-hidden rounded-[inherit]">
          <span className="absolute inset-0 grid place-items-center">{initials(name)}</span>
          <MediaImage id={photoId} alt="" className="absolute inset-0 h-full w-full" />
        </span>
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function VerifiedMark() {
  return <BadgeCheck className="h-4 w-4 shrink-0 fill-ink text-canvas" aria-label="Verified" />;
}

const MEDIA = { bottle: Sparkles, mountain: Mountain, dumbbell: Dumbbell, bag: ShoppingBag, lamp: Lamp, headphones: Headphones, bowl: Soup };
export type MediaKind = keyof typeof MEDIA;

/** Editorial photograph per sample media kind (fictional SAMPLE posts only). */
const SAMPLE_PHOTOS: Record<MediaKind, PhotoT> = {
  bottle: NICHE_PHOTOS.Skincare!,
  mountain: NICHE_PHOTOS.Travel!,
  dumbbell: NICHE_PHOTOS.Fitness!,
  bag: STORY.rack,
  lamp: NICHE_PHOTOS["Home Decor"]!,
  headphones: NICHE_PHOTOS.Tech!,
  bowl: NICHE_PHOTOS.Food!,
};

/** Photograph for demo content; the tone tint and icon show while it loads or offline. */
export function MediaArt({ tone, media, label }: { tone: Tone; media: MediaKind; label?: string }) {
  const Icon = MEDIA[media];
  return (
    <div className={`group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br ${TONES[tone].bg}`}>
      <Icon className={`absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 ${TONES[tone].fg}`} strokeWidth={1.5} aria-hidden="true" />
      <Photo photo={{ ...SAMPLE_PHOTOS[media], alt: label ? `Photo for: ${label}` : SAMPLE_PHOTOS[media].alt }} sizes="(min-width: 768px) 560px, 100vw" className="photo-zoom" />
    </div>
  );
}
