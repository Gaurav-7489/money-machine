"use client";

import { useCallback } from "react";
import { uid } from "./format";
import { useStore } from "./store";
import type { Post } from "./types";
import { postInput, fieldErrors, type FieldErrors } from "./validation";

export const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

/**
 * Shrinks a photo so it fits in this device's storage (preview build).
 * Longest side max 1080px, JPEG. Throws a friendly message on failure.
 */
export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't a photo. Please pick a JPG, PNG or WebP image.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("That photo is too big (over 15 MB). Please pick a smaller one.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("We couldn't open that photo. Please try another one."));
      i.src = url;
    });
    for (const [edge, quality] of [[1080, 0.8], [800, 0.7], [640, 0.6]] as const) {
      const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", quality);
      if (data.length < 450_000) return data;
    }
    throw new Error("That photo is too detailed to save on this device. Please try a smaller one.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function parseTags(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, "").toLowerCase())
    .filter(Boolean)
    .slice(0, 10);
}

/** Validates and saves a new post. Returns field errors, or null on success. */
export function usePublishPost() {
  const { session, update } = useStore();
  return useCallback(
    (input: { caption: string; tags?: string; tone?: Post["tone"]; image?: string }): FieldErrors | null => {
      const parsed = postInput.safeParse({ caption: input.caption, tags: input.tags ?? "" });
      if (!parsed.success) return fieldErrors(parsed.error);
      const post: Post = {
        id: uid("post"),
        authorHandle: session!.handle,
        caption: parsed.data.caption,
        tags: parseTags(parsed.data.tags ?? ""),
        tone: input.tone ?? "mint",
        image: input.image,
        createdAt: new Date().toISOString(),
      };
      update((s) => ({ ...s, posts: [post, ...s.posts] }));
      return null;
    },
    [session, update],
  );
}
