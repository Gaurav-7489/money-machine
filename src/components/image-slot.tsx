"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { useFeedback } from "./feedback";
import { deleteMedia, saveMedia, useMediaUrl } from "@/lib/media";
import { compressImage } from "@/lib/posts";

/** Compress a picked photo and keep it in this device's media store. Returns its media id. */
export async function storePhoto(file: File): Promise<string> {
  const dataUrl = await compressImage(file);
  const blob = await (await fetch(dataUrl)).blob();
  return saveMedia(blob);
}

/** A photo kept in the on-device media store, or `fallback` while loading / when there is none. */
export function MediaImage({ id, alt, className = "", fallback = null }: { id?: string; alt: string; className?: string; fallback?: ReactNode }) {
  const { url } = useMediaUrl(id);
  if (!id || !url) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={`object-cover ${className}`} />;
}

/**
 * Add / change / remove one photo. Changes apply immediately through `onChange`
 * (the previous photo is deleted from the device once replaced or removed).
 */
export function ImageSlot({
  id,
  onChange,
  label,
  aspect = "aspect-[16/9]",
  round = false,
  placeholder,
}: {
  id?: string;
  onChange: (id: string | undefined) => void;
  label: string;
  aspect?: string;
  round?: boolean;
  /** shown when there is no photo (e.g. the default editorial image) */
  placeholder?: ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useFeedback();

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const next = await storePhoto(file);
      if (id) void deleteMedia(id);
      onChange(next);
      toast(`${label} updated`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "We couldn't use that photo.", "error");
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    if (id) void deleteMedia(id);
    onChange(undefined);
    toast(`${label} removed`, "info");
  }

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium">{label}</p>
      <div className="flex items-center gap-3">
        <div className={`relative shrink-0 overflow-hidden border border-line bg-elevated ${round ? "h-20 w-20 rounded-full" : `w-40 rounded-[10px] ${aspect}`}`}>
          <MediaImage id={id} alt="" className="absolute inset-0 h-full w-full" fallback={placeholder} />
          {busy && <span className="absolute inset-0 grid place-items-center bg-canvas/60"><Loader2 className="h-5 w-5 animate-spin" /></span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={input} type="file" accept="image/*" onChange={pick} className="sr-only" tabIndex={-1} aria-hidden="true" />
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-[13px] font-semibold hover:border-ink disabled:opacity-50">
            <ImagePlus className="h-4 w-4" /> {id ? "Change" : "Add photo"}
          </button>
          {id && (
            <button type="button" onClick={remove} disabled={busy} className="press inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-danger hover:bg-elevated">
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
