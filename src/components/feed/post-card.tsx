"use client";

import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Repeat2, Send, SendHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar, MediaArt, TONES, VerifiedMark } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { SampleTag } from "@/components/ui";
import { formatCompact, timeAgo, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Tone } from "@/lib/sample-data";

export interface FeedPost {
  id: string;
  authorHandle: string;
  authorName: string;
  authorTone: Tone;
  /** creator or business, used by the feed tabs */
  authorKind?: "creator" | "business";
  verified?: boolean;
  caption: string;
  tags: string[];
  createdAt: string;
  sample?: boolean;
  /** true for the signed-in user's own posts */
  mine?: boolean;
  media?: "bottle" | "mountain" | "dumbbell" | "bag";
  image?: string;
  tone: Tone;
  likes: number;
  comments: number;
}

function Action({ onClick, pressed, label, icon, activeCls = "" }: { onClick: () => void; pressed?: boolean; label: string; icon: React.ReactNode; activeCls?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`press flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-canvas ${pressed ? activeCls : "text-ink/80"}`}
    >
      {icon}
      <span className="max-[380px]:sr-only">{label}</span>
    </button>
  );
}

export function PostCard({ post }: { post: FeedPost }) {
  const { liked, saved, reposts, comments, session, toggle, update } = useStore();
  const { toast, confirm } = useFeedback();
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const isLiked = liked.includes(post.id);
  const isSaved = saved.includes(post.id);
  const isReposted = reposts.includes(post.id);
  const myComments = comments.filter((c) => c.postId === post.id);
  const likeCount = post.likes + (isLiked ? 1 : 0);
  const commentCount = post.comments + myComments.length;
  const repostCount = isReposted ? 1 : 0;
  const authorHref = post.mine ? "/profile" : `/u/${post.authorHandle}`;

  async function share() {
    const url = `${window.location.origin}/home#${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Money Machine", text: post.caption, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied. Paste it anywhere to share.");
      }
    } catch {
      /* user cancelled */
    }
  }

  function repost() {
    toggle("reposts", post.id);
    toast(isReposted ? "Repost removed" : "Reposted to your profile!", isReposted ? "info" : "success");
  }

  function saveToggle() {
    toggle("saved", post.id);
    toast(isSaved ? "Removed from Saved" : "Post saved. Find it in Saved.", isSaved ? "info" : "success");
  }

  function addComment(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !session) return;
    if (body.length > 500) return toast("Comments can be up to 500 characters.", "error");
    update((s) => ({
      ...s,
      comments: [...s.comments, { id: uid("cmt"), postId: post.id, authorHandle: session.handle, authorName: session.displayName, body, createdAt: new Date().toISOString() }],
    }));
    setDraft("");
    toast("Comment added");
  }

  async function removeComment(id: string) {
    if (!(await confirm({ title: "Delete this comment?", confirmLabel: "Delete", danger: true }))) return;
    update((s) => ({ ...s, comments: s.comments.filter((c) => c.id !== id) }));
    toast("Comment deleted", "info");
  }

  async function removePost() {
    if (!(await confirm({ title: "Delete this post?", body: "It will be removed from the feed and your profile. This can't be undone.", confirmLabel: "Delete post", danger: true }))) return;
    update((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== post.id), comments: s.comments.filter((c) => c.postId !== post.id) }));
    toast("Post deleted", "info");
  }

  return (
    <article id={post.id} className="card scroll-mt-24 overflow-hidden">
      {isReposted && (
        <p className="flex items-center gap-1.5 border-b border-line bg-canvas/60 px-4 py-1.5 text-xs font-medium text-muted">
          <Repeat2 className="h-3.5 w-3.5" /> You reposted this
        </p>
      )}
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href={authorHref} aria-label={`View ${post.authorName}'s profile`}>
          <Avatar name={post.authorName} tone={post.authorTone} square={post.authorKind === "business"} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm">
            <Link href={authorHref} className="truncate font-semibold hover:underline">{post.authorName}</Link>
            {post.verified && <VerifiedMark />}
            {post.authorKind && (
              <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${post.authorKind === "business" ? "bg-violet-50 text-violet-700" : "bg-rose-50 text-rose-700"}`}>
                {post.authorKind === "business" ? "Business" : "Creator"}
              </span>
            )}
          </p>
          <p className="text-xs text-muted">@{post.authorHandle} · {timeAgo(post.createdAt)}</p>
        </div>
        {post.sample && <SampleTag />}
        {post.mine && (
          <button onClick={removePost} className="press grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Delete post" title="Delete post">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {post.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- user photo stored as a data URL in the preview build
        <img src={post.image} alt={post.caption} className="max-h-[560px] w-full bg-canvas object-cover" />
      ) : post.media ? (
        <MediaArt tone={post.tone} media={post.media} label={post.caption} />
      ) : (
        <div className={`grid aspect-[4/3] place-items-center bg-gradient-to-br px-8 text-center ${TONES[post.tone].bg}`}>
          <p className="text-xl font-semibold leading-snug text-ink/80 md:text-2xl">{post.caption}</p>
        </div>
      )}

      <div className="px-4 pt-3 text-sm">
        {(post.media || post.image) && <p className="whitespace-pre-wrap">{post.caption}</p>}
        {post.tags.length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-2 text-brand-700">
            {post.tags.map((t) => (
              <Link key={t} href={`/explore?q=${encodeURIComponent(t)}`} className="hover:underline">
                #{t}
              </Link>
            ))}
          </p>
        )}
        <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-muted">
          <span>{formatCompact(likeCount)} {likeCount === 1 ? "like" : "likes"}</span>
          <button onClick={() => setShowComments((v) => !v)} className="hover:underline">{formatCompact(commentCount)} {commentCount === 1 ? "comment" : "comments"}</button>
          {repostCount > 0 && <span>{repostCount} repost</span>}
        </p>
      </div>

      <div className="mx-2 mt-2 flex border-t border-line py-1">
        <Action
          onClick={() => toggle("liked", post.id)}
          pressed={isLiked}
          label={isLiked ? "Liked" : "Like"}
          activeCls="text-rose-600"
          icon={<Heart className={`h-5 w-5 ${isLiked ? "animate-pop fill-rose-500 text-rose-500" : ""}`} />}
        />
        <Action onClick={() => setShowComments((v) => !v)} pressed={showComments} label="Comment" activeCls="text-brand-700" icon={<MessageCircle className="h-5 w-5" />} />
        {!post.mine && (
          <Action onClick={repost} pressed={isReposted} label={isReposted ? "Reposted" : "Repost"} activeCls="text-brand-700" icon={<Repeat2 className={`h-5 w-5 ${isReposted ? "animate-pop" : ""}`} />} />
        )}
        <Action onClick={share} label="Share" icon={<Send className="h-[19px] w-[19px]" />} />
        <Action
          onClick={saveToggle}
          pressed={isSaved}
          label={isSaved ? "Saved" : "Save"}
          activeCls="text-amber-700"
          icon={<Bookmark className={`h-5 w-5 ${isSaved ? "animate-pop fill-current" : ""}`} />}
        />
      </div>

      {showComments && (
        <section className="animate-fade-in border-t border-line bg-canvas/50 px-4 py-3" aria-label="Comments">
          {post.sample && post.comments > 0 && (
            <p className="mb-2 text-xs text-muted">The {formatCompact(post.comments)} earlier comments are sample numbers and aren&apos;t shown in this preview.</p>
          )}
          {myComments.length > 0 ? (
            <ul className="mb-3 space-y-2">
              {myComments.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <Avatar name={c.authorName} tone={session?.role === "business" ? "violet" : "rose"} size="xs" />
                  <div className="min-w-0 flex-1 rounded-2xl bg-surface px-3 py-2 text-sm ring-1 ring-line">
                    <p className="text-xs font-semibold">{c.authorName} <span className="font-normal text-muted">· {timeAgo(c.createdAt)}</span></p>
                    <p className="whitespace-pre-wrap break-words">{c.body}</p>
                  </div>
                  {c.authorHandle === session?.handle && (
                    <button onClick={() => removeComment(c.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-rose-50 hover:text-rose-600" aria-label="Delete comment">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            !post.sample && <p className="mb-2 text-xs text-muted">No comments yet. Be the first!</p>
          )}
          <form onSubmit={addComment} className="flex items-center gap-2">
            <label htmlFor={`c-${post.id}`} className="sr-only">Write a comment</label>
            <input
              id={`c-${post.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              placeholder="Write a comment…"
              className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
            <button type="submit" disabled={!draft.trim()} className="press inline-flex h-11 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
              <SendHorizontal className="h-4 w-4" /> Post
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
