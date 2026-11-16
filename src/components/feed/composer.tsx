"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { Button } from "@/components/ui";
import { compressImage, usePublishPost } from "@/lib/posts";
import { useStore } from "@/lib/store";

const LIMIT = 2200;

/** The "write a post" box at the top of the feed. */
export function Composer() {
  const { session } = useStore();
  const publish = usePublishPost();
  const { toast } = useFeedback();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!session) return null;

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setImage(await compressImage(file));
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const tags = Array.from(caption.matchAll(/#([\p{L}\p{N}_]+)/gu), (m) => m[1]).join(" ");
    const errs = publish({ caption, tags, image });
    if (errs) {
      setError(errs.caption ?? "Please check your post.");
      return;
    }
    setCaption("");
    setImage(undefined);
    setError("");
    toast("Your post is live!");
  }

  return (
    <form onSubmit={submit} className="card mb-5 p-4" aria-label="Create a post" noValidate>
      <div className="flex gap-3">
        <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} square={session.role === "business"} />
        <div className="min-w-0 flex-1">
          <label htmlFor="composer" className="sr-only">Write a post</label>
          <textarea
            id="composer"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              if (error) setError("");
            }}
            maxLength={LIMIT}
            rows={caption.length > 80 ? 4 : 2}
            placeholder={session.role === "business" ? "Share news, a deal or a collab you're looking for…" : "What are you working on? Add #tags to be found."}
            className="w-full resize-none rounded-xl border border-transparent bg-canvas px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-muted focus:border-brand-400 focus:bg-surface focus:ring-4 focus:ring-brand-100"
            aria-invalid={!!error}
            aria-describedby={error ? "composer-err" : undefined}
          />
          {error && <p id="composer-err" role="alert" className="mt-1 text-[12px] text-rose-600">{error}</p>}
          {image && (
            <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Photo you're about to post" className="max-h-72 w-full object-cover" />
              <button type="button" onClick={() => setImage(undefined)} className="absolute right-2 top-2 inline-flex h-9 items-center gap-1 rounded-full bg-ink/80 px-3 text-xs font-semibold text-white hover:bg-ink" aria-label="Remove photo">
                <X className="h-4 w-4" /> Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="sr-only" id="composer-photo" tabIndex={-1} />
        <Button type="button" variant="ghost" size="md" onClick={() => fileRef.current?.click()} disabled={busy} className="px-3 text-brand-700">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />} {image ? "Change photo" : "Add photo"}
        </Button>
        <span className={`ml-auto text-xs tabular-nums ${caption.length > LIMIT - 100 ? "text-amber-700" : "text-muted"}`} aria-live="polite">
          {caption.length > 0 ? `${caption.length}/${LIMIT}` : ""}
        </span>
        <Button type="submit" disabled={!caption.trim() || busy}>Publish</Button>
      </div>
    </form>
  );
}
