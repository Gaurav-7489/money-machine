"use client";

import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Avatar, MediaArt, TONES, VerifiedMark } from "@/components/art";
import { SampleTag, Toast } from "@/components/ui";
import { formatCompact, timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Tone } from "@/lib/sample-data";

export interface FeedPost {
  id: string;
  authorHandle: string;
  authorName: string;
  authorTone: Tone;
  verified?: boolean;
  caption: string;
  tags: string[];
  createdAt: string;
  sample?: boolean;
  media?: "bottle" | "mountain" | "dumbbell" | "bag";
  tone: Tone;
  likes: number;
  comments: number;
}

export function PostCard({ post }: { post: FeedPost }) {
  const { liked, saved, toggle } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const isLiked = liked.includes(post.id);
  const isSaved = saved.includes(post.id);

  async function share() {
    const url = `${window.location.origin}/home#${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Money Machine", text: post.caption, url });
      else {
        await navigator.clipboard.writeText(url);
        setToast("Link copied");
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <article id={post.id} className="card overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-3">
        <Avatar name={post.authorName} tone={post.authorTone} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold">
            <span className="truncate">{post.authorHandle}</span>
            {post.verified && <VerifiedMark />}
          </p>
          <p className="text-xs text-muted">{timeAgo(post.createdAt)}</p>
        </div>
        {post.sample && <SampleTag />}
      </header>

      {post.media ? (
        <MediaArt tone={post.tone} media={post.media} label={post.caption} />
      ) : (
        <div className={`grid aspect-[4/3] place-items-center bg-gradient-to-br px-8 text-center ${TONES[post.tone].bg}`}>
          <p className="text-xl font-semibold leading-snug text-ink/80 md:text-2xl">{post.caption}</p>
        </div>
      )}

      <div className="flex items-center gap-4 px-4 pt-3">
        <button
          onClick={() => toggle("liked", post.id)}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Unlike" : "Like"}
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <Heart className={`h-[22px] w-[22px] transition ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
          {formatCompact(post.likes + (isLiked ? 1 : 0))}
        </button>
        <span className="flex items-center gap-1.5 text-sm font-medium" aria-label={`${post.comments} comments`}>
          <MessageCircle className="h-[22px] w-[22px]" />
          {formatCompact(post.comments)}
        </span>
        <button onClick={share} aria-label="Share" className="flex items-center">
          <Send className="h-[21px] w-[21px]" />
        </button>
        <button onClick={() => toggle("saved", post.id)} aria-pressed={isSaved} aria-label={isSaved ? "Remove from saved" : "Save"} className="ml-auto">
          <Bookmark className={`h-[22px] w-[22px] ${isSaved ? "fill-ink" : ""}`} />
        </button>
      </div>
      <div className="px-4 pb-4 pt-2 text-sm">
        {post.media && <p>{post.caption}</p>}
        {post.tags.length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-2 text-brand-600">
            {post.tags.map((t) => (
              <Link key={t} href={`/explore?q=${encodeURIComponent(t)}`} className="hover:underline">
                #{t}
              </Link>
            ))}
          </p>
        )}
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </article>
  );
}
