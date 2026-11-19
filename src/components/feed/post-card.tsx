"use client";

import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Quote, Repeat2, Send, SendHorizontal, Smile, SmilePlus, Sticker, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Avatar, MediaArt, TONES, VerifiedMark, type MediaKind } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { SampleTag, Sheet } from "@/components/ui";
import { formatCompact, timeAgo, uid } from "@/lib/format";
import { usePublishPost } from "@/lib/posts";
import { SAMPLE_COMMENTS, profileByHandle, type Tone } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { GifPicker, GifView } from "./gifs";
import { QUICK_EMOJI } from "./composer";
import { VideoView } from "./video";

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
  media?: MediaKind;
  image?: string;
  images?: string[];
  videoId?: string;
  gif?: string;
  quoteOf?: string;
  tone: Tone;
  likes: number;
  comments: number;
  reposts?: number;
}

export const REACTIONS = ["❤️", "🔥", "😂", "😍", "👏", "💸", "🤯", "🙌"];

/** Caption with clickable #tags and @mentions. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/([#@][\p{L}\p{N}_.]+)/gu);
  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
      {parts.map((p, i) =>
        p.startsWith("#") ? (
          <Link key={i} href={`/explore?q=${encodeURIComponent(p.slice(1))}`} className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:decoration-current">{p}</Link>
        ) : p.startsWith("@") && p.length > 1 ? (
          <Link key={i} href={`/u/${p.slice(1)}`} className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:decoration-current">{p}</Link>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}

function Photos({ list, alt }: { list: string[]; alt: string }) {
  if (list.length === 1)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={list[0]} alt={alt} className="max-h-[560px] w-full rounded-xl bg-elevated object-cover" />;
  return (
    <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
      {list.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt={`${alt} (${i + 1} of ${list.length})`} className={`w-full object-cover ${list.length === 3 && i === 0 ? "row-span-2 h-full" : "aspect-square"}`} />
      ))}
    </div>
  );
}

function Stat({ onClick, pressed, label, count, icon, activeCls = "", title }: { onClick: () => void; pressed?: boolean; label: string; count?: number; icon: React.ReactNode; activeCls?: string; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      title={title ?? label}
      className={`press flex h-10 items-center gap-1 rounded-full px-2 text-[13px] font-medium transition-colors hover:bg-elevated max-[360px]:px-1 sm:gap-1.5 sm:px-2.5 ${pressed ? activeCls : "text-muted hover:text-ink"}`}
    >
      {icon}
      <span className="sr-only">{label}</span>
      {count !== undefined && count > 0 && <span className="tabular-nums" aria-hidden="true">{formatCompact(count)}</span>}
    </button>
  );
}

/** Small embedded card for a quoted post. */
export function QuotedPost({ post }: { post: FeedPost | undefined }) {
  if (!post) return <p className="mt-2 rounded-xl border border-line px-3 py-2 text-sm text-muted">This post isn&apos;t available.</p>;
  return (
    <Link href={`/home#${post.id}`} className="mt-2 block rounded-xl border border-line p-3 transition-colors hover:border-ink">
      <p className="flex items-center gap-1.5 text-[13px]">
        <Avatar name={post.authorName} tone={post.authorTone} size="xs" square={post.authorKind === "business"} />
        <span className="font-semibold">{post.authorName}</span>
        <span className="text-muted">@{post.authorHandle}</span>
      </p>
      <p className="mt-1 line-clamp-3 text-sm">{post.caption || (post.gif ? "GIF" : "Photo")}</p>
    </Link>
  );
}

export function PostCard({ post, quoted }: { post: FeedPost; quoted?: FeedPost }) {
  const { liked, saved, reposts, comments, reactions, session, toggle, update } = useStore();
  const { toast, confirm } = useFeedback();
  const publish = usePublishPost();
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftGif, setDraftGif] = useState<string | undefined>();
  const [gifOpen, setGifOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [reactOpen, setReactOpen] = useState(false);
  const [repostMenu, setRepostMenu] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const isLiked = liked.includes(post.id);
  const isSaved = saved.includes(post.id);
  const isReposted = reposts.includes(post.id);
  const myReaction = reactions[post.id];
  const allComments = [...SAMPLE_COMMENTS.filter((c) => c.postId === post.id), ...comments.filter((c) => c.postId === post.id)].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const mineCount = comments.filter((c) => c.postId === post.id).length;
  const likeCount = post.likes + (isLiked ? 1 : 0);
  const commentCount = post.comments + mineCount;
  const repostCount = (post.reposts ?? 0) + (isReposted ? 1 : 0);
  const authorHref = post.mine ? "/profile" : `/u/${post.authorHandle}`;
  const photos = [post.image, ...(post.images ?? [])].filter(Boolean) as string[];
  const visibleComments = showComments ? allComments : allComments.slice(-2);

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
    setRepostMenu(false);
    toggle("reposts", post.id);
    toast(isReposted ? "Repost removed" : "Reposted to your profile!", isReposted ? "info" : "success");
  }

  function react(e: string) {
    setReactOpen(false);
    update((s) => {
      const next = { ...s.reactions };
      if (next[post.id] === e) delete next[post.id];
      else next[post.id] = e;
      return { ...s, reactions: next };
    });
  }

  function saveToggle() {
    toggle("saved", post.id);
    toast(isSaved ? "Removed from Saved" : "Post saved. Find it in Saved.", isSaved ? "info" : "success");
  }

  function addComment(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if ((!body && !draftGif) || !session) return;
    if (body.length > 500) return toast("Comments can be up to 500 characters.", "error");
    update((s) => ({
      ...s,
      comments: [...s.comments, { id: uid("cmt"), postId: post.id, authorHandle: session.handle, authorName: session.displayName, body, gif: draftGif, createdAt: new Date().toISOString() }],
    }));
    setDraft("");
    setDraftGif(undefined);
    setEmojiOpen(false);
    setShowComments(true);
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

  function sendQuote(e: React.FormEvent) {
    e.preventDefault();
    const errs = publish({ caption: quoteText, quoteOf: post.id });
    if (errs) return toast(errs.caption ?? "Please check your post.", "error");
    setQuoting(false);
    setQuoteText("");
    toast("Quote posted!");
  }

  return (
    <article id={post.id} aria-label={`Post by ${post.authorName}`} className="scroll-mt-28 border-b border-line pb-3 pt-5">
      {isReposted && (
        <p className="mb-1.5 ml-12 flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Repeat2 className="h-3.5 w-3.5" /> You reposted
        </p>
      )}
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Link href={authorHref} aria-label={`View ${post.authorName}'s profile`}>
            <Avatar name={post.authorName} tone={post.authorTone} square={post.authorKind === "business"} />
          </Link>
          {allComments.length > 0 && <span className="mt-2 w-0.5 flex-1 rounded-full bg-line" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <header className="flex items-start gap-2">
            <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 text-[14px] leading-tight">
              <Link href={authorHref} className="truncate font-semibold hover:underline">{post.authorName}</Link>
              {post.verified && <VerifiedMark />}
              <span className="truncate text-muted">@{post.authorHandle}</span>
              <span className="text-muted">· {timeAgo(post.createdAt)}</span>
              {post.authorKind === "business" && <span className="rounded-full border border-line px-1.5 py-px text-[11px] font-medium text-muted">Business</span>}
            </p>
            {post.sample && <SampleTag />}
            {post.mine && (
              <button onClick={removePost} className="press -mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-elevated hover:text-danger" aria-label="Delete post" title="Delete post">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </header>

          {post.caption && <div className="mt-1"><RichText text={post.caption} /></div>}
          {post.tags.length > 0 && !post.caption.includes("#") && (
            <p className="mt-1 flex flex-wrap gap-x-2 text-[14px] text-brand-600">
              {post.tags.map((t) => <Link key={t} href={`/explore?q=${encodeURIComponent(t)}`} className="hover:underline">#{t}</Link>)}
            </p>
          )}

          <div className="mt-3 empty:hidden">
            {photos.length > 0 ? (
              <Photos list={photos} alt={post.caption || "Photo"} />
            ) : post.videoId ? (
              <VideoView id={post.videoId} />
            ) : post.gif ? (
              <GifView id={post.gif} size="lg" />
            ) : post.media ? (
              <MediaArt tone={post.tone} media={post.media} label={post.caption} />
            ) : !post.quoteOf && post.caption.length < 90 && post.sample ? null : null}
          </div>
          {post.quoteOf && <QuotedPost post={quoted} />}

          {myReaction && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[12px]">
              <span>{myReaction}</span> <span className="text-muted">You reacted</span>
            </p>
          )}

          <div className="relative mt-1 flex items-center -ml-2.5 max-sm:-ml-[54px] max-sm:w-[calc(100%+54px)] max-sm:justify-between">
            <Stat
              onClick={() => toggle("liked", post.id)}
              pressed={isLiked}
              label={isLiked ? "Liked" : "Like"}
              count={likeCount}
              activeCls="text-accent-2"
              icon={<span key={String(isLiked)} className={isLiked ? "burst" : ""}><Heart className={`h-[19px] w-[19px] ${isLiked ? "animate-pop fill-accent-2 text-accent-2" : ""}`} /></span>}
            />
            <Stat onClick={() => setShowComments((v) => !v)} pressed={showComments} label="Comment" count={commentCount} activeCls="text-brand-600" icon={<MessageCircle className="h-[19px] w-[19px]" />} />
            <div className="relative">
              <Stat onClick={() => (post.mine ? setQuoting(true) : setRepostMenu((v) => !v))} pressed={isReposted} label={isReposted ? "Reposted" : "Repost"} count={repostCount} activeCls="text-gain" icon={<Repeat2 className={`h-[19px] w-[19px] ${isReposted ? "animate-pop" : ""}`} />} />
              {repostMenu && (
                <div className="animate-scale-in absolute bottom-full left-0 z-20 mb-1 w-44 origin-bottom-left overflow-hidden rounded-xl border border-line bg-surface shadow-xl" role="menu">
                  <button role="menuitem" onClick={repost} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-elevated"><Repeat2 className="h-4 w-4" /> {isReposted ? "Undo repost" : "Repost"}</button>
                  <button role="menuitem" onClick={() => { setRepostMenu(false); setQuoting(true); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-elevated"><Quote className="h-4 w-4" /> Quote</button>
                </div>
              )}
            </div>
            <div>
              <Stat onClick={() => setReactOpen((v) => !v)} pressed={!!myReaction} label="React with an emoji" activeCls="text-ink" icon={myReaction ? <span className="text-[17px] leading-none">{myReaction}</span> : <SmilePlus className="h-[19px] w-[19px]" />} />
              {reactOpen && (
                <div className="animate-scale-in absolute bottom-full left-0 right-0 z-20 mx-auto mb-1 flex w-fit max-w-full origin-bottom flex-wrap justify-center gap-0.5 rounded-full border border-line bg-surface p-1 shadow-xl" role="menu" aria-label="Reactions">
                  {REACTIONS.map((e) => (
                    <button key={e} role="menuitem" onClick={() => react(e)} className={`press grid h-9 w-9 place-items-center rounded-full text-xl transition-transform hover:scale-125 ${myReaction === e ? "bg-signal/30" : ""}`} aria-label={`React ${e}`}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Stat onClick={share} label="Share" icon={<Send className="h-[18px] w-[18px]" />} />
            <span className="flex-1 max-sm:hidden" />
            <Stat onClick={saveToggle} pressed={isSaved} label={isSaved ? "Saved" : "Save"} activeCls="text-ink" icon={<Bookmark className={`h-[19px] w-[19px] ${isSaved ? "animate-pop fill-current" : ""}`} />} />
          </div>
        </div>
      </div>

      {(visibleComments.length > 0 || showComments) && (
        <section className="animate-fade-in pb-2" aria-label="Comments">
          {!showComments && allComments.length > 2 && (
            <button onClick={() => setShowComments(true)} className="mb-1 ml-12 text-[13px] font-semibold text-muted hover:text-ink">View all {allComments.length} comments</button>
          )}
          {visibleComments.length > 0 && (
            <ul className="space-y-2.5">
              {visibleComments.map((c) => {
                const prof = profileByHandle(c.authorHandle);
                const isMe = c.authorHandle === session?.handle;
                return (
                  <li key={c.id} className="flex items-start gap-3">
                    <Avatar name={c.authorName} tone={prof?.tone ?? (session?.role === "business" ? "violet" : "rose")} size="sm" square={prof?.kind === "business"} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px]">
                        <Link href={isMe ? "/profile" : `/u/${c.authorHandle}`} className="font-semibold hover:underline">{c.authorName}</Link>{" "}
                        <span className="text-muted">· {timeAgo(c.createdAt)}</span>
                      </p>
                      {c.body && <p className="whitespace-pre-wrap break-words text-[14px]">{c.body}</p>}
                      {"gif" in c && c.gif && <div className="mt-1"><GifView id={c.gif} size="sm" /></div>}
                    </div>
                    {isMe && (
                      <button onClick={() => removeComment(c.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-elevated hover:text-danger" aria-label="Delete comment">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {showComments && (
            <form onSubmit={addComment} className="mt-3">
              {draftGif && (
                <div className="relative mb-2 ml-12 inline-block">
                  <GifView id={draftGif} size="sm" />
                  <button type="button" onClick={() => setDraftGif(undefined)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white" aria-label="Remove GIF from comment">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {emojiOpen && (
                <div className="mb-2 ml-12 flex flex-wrap gap-1">
                  {QUICK_EMOJI.map((em) => (
                    <button key={em} type="button" onClick={() => setDraft((d) => d + em)} className="press grid h-8 w-8 place-items-center rounded-lg text-lg hover:bg-elevated" aria-label={`Add ${em}`}>{em}</button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setGifOpen(true)} className="press grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-elevated hover:text-ink" aria-label="Add a GIF to your comment" title="GIF">
                  <Sticker className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setEmojiOpen((o) => !o)} aria-pressed={emojiOpen} className="press grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-elevated hover:text-ink" aria-label="Add emoji to your comment" title="Emoji">
                  <Smile className="h-5 w-5" />
                </button>
                <label htmlFor={`c-${post.id}`} className="sr-only">Write a comment</label>
                <input
                  id={`c-${post.id}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={500}
                  placeholder={`Reply to ${post.authorName}…`}
                  className="h-10 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-sm outline-none transition-colors focus:border-ink"
                />
                <button type="submit" disabled={!draft.trim() && !draftGif} className="press grid h-10 w-10 shrink-0 place-items-center rounded-full bg-aurora text-on-accent disabled:opacity-40" aria-label="Post comment">
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <GifPicker open={gifOpen} onClose={() => setGifOpen(false)} onPick={(id) => { setDraftGif(id); setShowComments(true); }} />
      <Sheet open={quoting} onClose={() => setQuoting(false)} title="Quote post">
        <form onSubmit={sendQuote} className="space-y-3">
          <label htmlFor={`q-${post.id}`} className="sr-only">Add your thoughts</label>
          <textarea id={`q-${post.id}`} value={quoteText} onChange={(e) => setQuoteText(e.target.value)} maxLength={2200} rows={3} autoFocus placeholder="Add your thoughts…" className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-ink" />
          <QuotedPost post={post} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setQuoting(false)} className="press h-11 flex-1 rounded-full border border-line font-semibold hover:border-ink">Cancel</button>
            <button type="submit" className="press h-11 flex-1 rounded-full bg-ink font-semibold text-canvas">Post quote</button>
          </div>
        </form>
      </Sheet>
    </article>
  );
}

export { TONES };
