"use client";

import { useMemo } from "react";
import type { FeedPost } from "@/components/feed/post-card";
import { SAMPLE_POSTS, profileByHandle, type Tone } from "./sample-data";
import { useStore } from "./store";

export function useFeed(): FeedPost[] {
  const { posts, session } = useStore();
  return useMemo(() => {
    const mine: FeedPost[] = posts.map((p) => ({
      id: p.id,
      authorHandle: p.authorHandle,
      authorName: session?.displayName ?? p.authorHandle,
      authorTone: (session?.role === "business" ? "violet" : "rose") as Tone,
      caption: p.caption,
      tags: p.tags,
      createdAt: p.createdAt,
      tone: p.tone ?? "mint",
      likes: 0,
      comments: 0,
    }));
    const samples: FeedPost[] = SAMPLE_POSTS.map((p) => {
      const prof = profileByHandle(p.authorHandle)!;
      return { ...p, authorName: prof.name, authorTone: prof.tone, verified: prof.verified };
    });
    return [...mine, ...samples].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [posts, session]);
}
