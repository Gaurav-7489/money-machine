"use client";

import { Film, ImagePlus, Loader2, Smile, Sticker, X } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { Button } from "@/components/ui";
import { MAX_VIDEO_BYTES, saveMedia } from "@/lib/media";
import { compressImage, usePublishPost } from "@/lib/posts";
import { useStore } from "@/lib/store";
import { GifPicker, GifView } from "./gifs";
import { VideoView } from "./video";

const LIMIT = 2200;
const MAX_PHOTOS = 4;
export const QUICK_EMOJI = ["🔥", "💸", "✨", "😂", "😍", "🙌", "💯", "🤝", "🚀", "💅", "👀", "🎉"];

/** The "start a thought" box at the top of the feed (Threads / X style). */
export function Composer({ autoFocus = false, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const { session } = useStore();
  const publish = usePublishPost();
  const { toast } = useFeedback();
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoId, setVideoId] = useState<string | undefined>();
  const [gif, setGif] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [gifOpen, setGifOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  if (!session) return null;
  const hasMedia = images.length > 0 || !!videoId || !!gif;

  async function pickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - images.length);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      const out: string[] = [];
      for (const f of files) out.push(await compressImage(f));
      setImages((x) => [...x, ...out].slice(0, MAX_PHOTOS));
      setVideoId(undefined);
      setGif(undefined);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) return toast("That file isn't a video. Please pick an MP4 or MOV.", "error");
    if (file.size > MAX_VIDEO_BYTES) return toast("That video is over 25 MB. Please trim it or pick a shorter one.", "error");
    setBusy(true);
    try {
      setVideoId(await saveMedia(file));
      setImages([]);
      setGif(undefined);
    } catch {
      toast("We couldn't save that video on this device.", "error");
    } finally {
      setBusy(false);
    }
  }

  function addEmoji(e: string) {
    const el = textRef.current;
    const at = el?.selectionStart ?? caption.length;
    setCaption((c) => (c.slice(0, at) + e + c.slice(at)).slice(0, LIMIT));
    requestAnimationFrame(() => el?.focus());
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tags = Array.from(caption.matchAll(/#([\p{L}\p{N}_]+)/gu), (m) => m[1]).join(" ");
    const errs = publish({ caption, tags, images, videoId, gif });
    if (errs) {
      setError(errs.caption ?? "Please check your post.");
      return;
    }
    setCaption("");
    setImages([]);
    setVideoId(undefined);
    setGif(undefined);
    setError("");
    setEmojiOpen(false);
    toast("Your thought is live! ✨");
    onDone?.();
  }

  const tool = "press grid h-10 w-10 place-items-center rounded-full text-brand-600 hover:bg-brand-50 disabled:opacity-40";

  return (
    <form onSubmit={submit} className="card mb-5 p-4" aria-label="Create a post" noValidate>
      <div className="flex gap-3">
        <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} square={session.role === "business"} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{session.displayName}</p>
          <label htmlFor="composer" className="sr-only">Write a post</label>
          <textarea
            ref={textRef}
            id="composer"
            autoFocus={autoFocus}
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              if (error) setError("");
            }}
            maxLength={LIMIT}
            rows={caption.length > 80 ? 4 : 2}
            placeholder={session.role === "business" ? "Share a thought, a launch or a deal… #tags help creators find you" : "Start a thought… add #tags so brands find you"}
            className="mt-0.5 w-full resize-none bg-transparent text-[16px] leading-snug outline-none placeholder:text-muted"
            aria-invalid={!!error}
            aria-describedby={error ? "composer-err" : undefined}
          />
          {error && <p id="composer-err" role="alert" className="mt-1 text-[12px] text-danger">{error}</p>}

          {images.length > 0 && (
            <div className={`mt-2 grid gap-1.5 ${images.length > 1 ? "grid-cols-2" : ""}`}>
              {images.map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl ring-1 ring-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1} you're about to post`} className={`w-full object-cover ${images.length > 1 ? "aspect-square" : "max-h-72"}`} />
                  <button type="button" onClick={() => setImages((x) => x.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-scrim/70 text-on-scrim" aria-label={`Remove photo ${i + 1}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {videoId && (
            <div className="relative mt-2">
              <VideoView id={videoId} />
              <button type="button" onClick={() => setVideoId(undefined)} className="absolute right-2 top-2 inline-flex h-8 items-center gap-1 rounded-full bg-scrim/70 px-3 text-xs font-semibold text-on-scrim" aria-label="Remove video">
                <X className="h-4 w-4" /> Remove
              </button>
            </div>
          )}
          {gif && (
            <div className="relative mt-2 inline-block">
              <GifView id={gif} />
              <button type="button" onClick={() => setGif(undefined)} className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-scrim/70 text-on-scrim" aria-label="Remove GIF">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {emojiOpen && (
            <div className="animate-fade-in mt-2 flex flex-wrap gap-1 rounded-2xl bg-elevated p-2" aria-label="Emoji">
              {QUICK_EMOJI.map((em) => (
                <button key={em} type="button" onClick={() => addEmoji(em)} className="press grid h-9 w-9 place-items-center rounded-xl text-xl hover:bg-surface" aria-label={`Add ${em}`}>
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-0.5 border-t border-line pt-3">
        <input ref={photoRef} type="file" accept="image/*" multiple onChange={pickPhotos} className="sr-only" tabIndex={-1} />
        <input ref={videoRef} type="file" accept="video/*" onChange={pickVideo} className="sr-only" tabIndex={-1} />
        <button type="button" className={tool} onClick={() => photoRef.current?.click()} disabled={busy || images.length >= MAX_PHOTOS} aria-label="Add photos" title="Photos (up to 4)">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        </button>
        <button type="button" className={tool} onClick={() => videoRef.current?.click()} disabled={busy} aria-label="Add video" title="Video">
          <Film className="h-5 w-5" />
        </button>
        <button type="button" className={tool} onClick={() => setGifOpen(true)} aria-label="Add GIF" title="GIF">
          <Sticker className="h-5 w-5" />
        </button>
        <button type="button" className={tool} onClick={() => setEmojiOpen((o) => !o)} aria-pressed={emojiOpen} aria-label="Add emoji" title="Emoji">
          <Smile className="h-5 w-5" />
        </button>
        <span className={`ml-auto mr-2 text-xs tabular-nums ${caption.length > LIMIT - 100 ? "text-accent" : "text-muted"}`} aria-live="polite">
          {caption.length > 0 ? `${caption.length}/${LIMIT}` : ""}
        </span>
        <Button type="submit" disabled={(!caption.trim() && !hasMedia) || busy}>Post</Button>
      </div>
      <GifPicker open={gifOpen} onClose={() => setGifOpen(false)} onPick={(id) => { setGif(id); setImages([]); setVideoId(undefined); }} />
    </form>
  );
}
