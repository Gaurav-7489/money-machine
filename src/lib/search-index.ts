"use client";

import { useMemo } from "react";
import type { PostIndex } from "./match";
import { SAMPLE_OPPORTUNITIES, SAMPLE_POSTS } from "./sample-data";
import { useStore } from "./store";

/** Builds the text index Search reads: every post caption + #tags, and opportunities, per author. */
export function buildPostIndex(items: { authorHandle: string; text: string }[]): PostIndex {
  const out: PostIndex = {};
  for (const i of items) (out[i.authorHandle] ??= []).push(i.text);
  return out;
}

export function usePostIndex(): PostIndex {
  const { posts, opportunities } = useStore();
  return useMemo(
    () =>
      buildPostIndex([
        ...SAMPLE_POSTS.map((p) => ({ authorHandle: p.authorHandle, text: `${p.caption} ${p.tags.map((t) => `#${t}`).join(" ")}` })),
        ...posts.map((p) => ({ authorHandle: p.authorHandle, text: `${p.caption} ${p.tags.map((t) => `#${t}`).join(" ")}` })),
        ...[...SAMPLE_OPPORTUNITIES, ...opportunities].map((o) => ({ authorHandle: o.ownerHandle, text: `${o.title} ${o.details} ${o.niches.join(" ")}` })),
      ]),
    [posts, opportunities],
  );
}
