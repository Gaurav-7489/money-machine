"use client";

import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useFeedback } from "@/components/feedback";
import { Sheet } from "@/components/ui";
import { MAX_GIF_BYTES, saveMedia, useMediaUrl } from "@/lib/media";

/**
 * Reaction GIFs. The built-in set is animated in CSS, so it works offline and
 * needs no third-party GIF service or API key. People can also upload their
 * own .gif files (stored on the device in the preview build).
 */
export const GIFS = [
  { id: "lets-go", text: "LET'S GO", emoji: "🚀", anim: "gif-bounce", bg: "bg-brand-100" },
  { id: "deal", text: "DEAL!", emoji: "🤝", anim: "gif-pulse", bg: "bg-brand-100" },
  { id: "paid", text: "GOT PAID", emoji: "💸", anim: "gif-rise", bg: "bg-brand-100" },
  { id: "fire", text: "FIRE", emoji: "🔥", anim: "gif-wiggle", bg: "bg-accent-soft" },
  { id: "slay", text: "SLAY", emoji: "💅", anim: "gif-wiggle", bg: "bg-elevated" },
  { id: "yay", text: "YAY!", emoji: "🎉", anim: "gif-bounce", bg: "bg-accent-soft" },
  { id: "omg", text: "OMG", emoji: "😱", anim: "gif-pulse", bg: "bg-elevated" },
  { id: "lol", text: "LOL", emoji: "😂", anim: "gif-bounce", bg: "bg-accent-soft" },
  { id: "love", text: "LOVE IT", emoji: "😍", anim: "gif-pulse", bg: "bg-brand-50" },
  { id: "clap", text: "BRAVO", emoji: "👏", anim: "gif-wiggle", bg: "bg-brand-100" },
  { id: "mindblown", text: "MIND BLOWN", emoji: "🤯", anim: "gif-pulse", bg: "bg-elevated" },
  { id: "money", text: "MONEY MOVES", emoji: "🤑", anim: "gif-spin", bg: "bg-brand-100" },
] as const;

export function GifView({ id, size = "md" }: { id: string; size?: "sm" | "md" | "lg" }) {
  if (id.startsWith("media:")) return <UploadedGif id={id.slice(6)} size={size} />;
  const g = GIFS.find((x) => x.id === id);
  if (!g) return null;
  const box = size === "sm" ? "h-24 w-36 text-[11px]" : size === "lg" ? "aspect-[16/10] w-full text-2xl" : "h-36 w-56 text-sm";
  const emoji = size === "sm" ? "text-3xl" : size === "lg" ? "text-7xl" : "text-5xl";
  return (
    <div role="img" aria-label={`GIF: ${g.text}`} className={`relative grid place-items-center overflow-hidden rounded-2xl ${g.bg} ${box}`}>
      <span className={`relative ${g.anim} ${emoji}`}>{g.emoji}</span>
      <span className="absolute bottom-2 left-0 right-0 text-center font-bold tracking-wide text-ink">{g.text}</span>
      <span className="absolute left-2 top-2 rounded bg-surface px-1.5 text-[9px] font-bold text-muted">GIF</span>
    </div>
  );
}

function UploadedGif({ id, size }: { id: string; size: "sm" | "md" | "lg" }) {
  const { url, missing } = useMediaUrl(id);
  const cls = size === "sm" ? "max-h-24" : size === "lg" ? "max-h-[420px] w-full" : "max-h-48";
  if (missing) return <p className="rounded-xl bg-elevated px-3 py-2 text-xs text-muted">GIF saved on another device</p>;
  if (!url) return <div className={`skeleton h-24 w-36`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="GIF" className={`rounded-2xl object-contain ${cls}`} />;
}

export function GifPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (id: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useFeedback();

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "image/gif") return toast("Please pick a .gif file.", "error");
    if (file.size > MAX_GIF_BYTES) return toast("That GIF is over 8 MB. Please pick a smaller one.", "error");
    setBusy(true);
    try {
      onPick(`media:${await saveMedia(file)}`);
      onClose();
    } catch {
      toast("We couldn't save that GIF on this device.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add a GIF">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {GIFS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              onPick(g.id);
              onClose();
            }}
            className="press overflow-hidden rounded-2xl ring-1 ring-line hover:ring-2 hover:ring-brand-400"
            aria-label={`Use GIF ${g.text}`}
          >
            <div className="pointer-events-none [&>div]:!h-24 [&>div]:!w-full">
              <GifView id={g.id} size="sm" />
            </div>
          </button>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/gif" className="sr-only" onChange={upload} tabIndex={-1} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="press mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-300 text-sm font-semibold text-brand-700 hover:bg-brand-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload your own GIF
      </button>
    </Sheet>
  );
}
