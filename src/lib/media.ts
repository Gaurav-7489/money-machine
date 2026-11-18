"use client";

/**
 * Device media store (preview build).
 *
 * Videos and uploaded GIFs are too big for localStorage, so they are kept in
 * this browser's IndexedDB and referenced from posts by id. Like the rest of
 * the preview data they never leave the device. Swap for Vercel Blob / R2
 * uploads when the backend is connected (docs/PLAN.md §1).
 */
import { useEffect, useState } from "react";
import { uid } from "./format";

const DB = "mm-media";
const STORE = "files";
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
export const MAX_GIF_BYTES = 8 * 1024 * 1024;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMedia(file: Blob): Promise<string> {
  const db = await open();
  const id = uid("media");
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return id;
}

export async function loadMedia(id: string): Promise<Blob | null> {
  const db = await open();
  return new Promise((resolve) => {
    const req = db.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function deleteMedia(id: string): Promise<void> {
  try {
    const db = await open();
    db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
  } catch {
    /* ignore */
  }
}

/** Object URL for a stored file; null while loading or if it's gone. */
export function useMediaUrl(id: string | undefined): { url: string | null; missing: boolean } {
  const [state, setState] = useState<{ url: string | null; missing: boolean }>({ url: null, missing: false });
  useEffect(() => {
    if (!id) return;
    let url: string | null = null;
    let alive = true;
    loadMedia(id)
      .then((blob) => {
        if (!alive) return;
        if (!blob) return setState({ url: null, missing: true });
        url = URL.createObjectURL(blob);
        setState({ url, missing: false });
      })
      .catch(() => alive && setState({ url: null, missing: true }));
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return state;
}
