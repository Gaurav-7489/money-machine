"use client";

import { TabIndicator } from "@/components/motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Sparkles, UsersRound } from "lucide-react";
import { Avatar } from "@/components/art";
import { Composer } from "@/components/feed/composer";
import { PostCard, type FeedPost } from "@/components/feed/post-card";
import { OpportunityList } from "@/components/opportunities";
import { GrowthCard, ProgramsCard, TabletQuickCards } from "@/components/side-panels";
import { EmptyState, Tip } from "@/components/ui";
import { useFeed } from "@/lib/feed";
import { filtersFromProfile, findMatches } from "@/lib/match";
import { SEARCHABLE_PROFILES } from "@/lib/sample-data";
import { usePostIndex } from "@/lib/search-index";
import { useStore } from "@/lib/store";

const TABS = [
  { id: "foryou", label: "For you" },
  { id: "friends", label: "Friends" },
  { id: "opps", label: "Opportunities" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** "Matched for you" avatars: the people Money Machine thinks you should meet. */
function MatchedRow() {
  const { session } = useStore();
  const posts = usePostIndex();
  const list = useMemo(() => (session ? findMatches(SEARCHABLE_PROFILES, filtersFromProfile(session), 50, posts).slice(0, 10) : []), [session, posts]);
  if (!session) return null;
  return (
    <section className="mb-4" aria-label="Matched for you">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[13px] font-bold"><Sparkles className="h-4 w-4 text-brand-500" /> Matched for you</h2>
        <Link href="/explore" className="text-[13px] font-semibold text-brand-700">See all</Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4">
        <Link href="/create" className="flex w-16 shrink-0 flex-col items-center gap-1">
          <span className="relative">
            <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} size="lg" />
            <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-aurora text-on-accent ring-2 ring-canvas"><Plus className="h-3 w-3" strokeWidth={3} /></span>
          </span>
          <span className="text-[11px]">New post</span>
        </Link>
        {list.map(({ profile: p, percent }) => (
          <Link key={p.handle} href={`/u/${p.handle}`} className="flex w-16 shrink-0 flex-col items-center gap-1">
            <span className="relative rounded-full bg-aurora p-[2.5px]">
              <span className="block rounded-full bg-elevated p-[2px]"><Avatar name={p.name} tone={p.tone} size="lg" /></span>
              {percent !== null && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-ink px-1.5 text-[10px] font-bold text-surface">{percent}%</span>}
            </span>
            <span className="mt-1 w-full truncate text-center text-[11px]">{p.name.split(" ")[0]}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** For you: entertainment first. Newer posts and posts with more conversation rise. */
function rank(feed: FeedPost[]): FeedPost[] {
  const now = Date.now();
  const score = (p: FeedPost) => {
    const hours = (now - new Date(p.createdAt).getTime()) / 3_600_000;
    const engagement = Math.log10(1 + p.likes + p.comments * 3 + (p.reposts ?? 0) * 4);
    return (p.mine ? 3 : 0) + engagement * 1.4 + (p.gif || p.videoId ? 0.6 : 0) - hours / 12;
  };
  return [...feed].sort((a, b) => score(b) - score(a));
}

export default function Home() {
  const [tab, setTab] = useState<TabId>("foryou");
  const feed = useFeed();
  const { following, session } = useStore();
  const byId = useMemo(() => new Map(feed.map((p) => [p.id, p])), [feed]);
  const list = tab === "foryou" ? rank(feed) : feed.filter((p) => following.includes(p.authorHandle) || p.authorHandle === session?.handle);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_240px] lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="sr-only">Feed</h1>
        <MatchedRow />
        <div role="tablist" aria-label="Feed" className="sticky top-[57px] z-20 -mx-4 mb-4 grid grid-cols-3 glass border-b border-line px-4 md:top-[65px] md:mx-0 md:px-0">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`relative py-3 text-[15px] transition ${tab === t.id ? "font-bold text-ink" : "text-muted hover:text-ink"}`}>
              {t.label}
              {tab === t.id && <TabIndicator group="feed" />}
            </button>
          ))}
        </div>

        {tab === "opps" ? (
          <OpportunityList />
        ) : (
          <>
            <Tip id="feed-intro-v2" title="Your feed, Threads-style">
              Share a thought, photos, a video or a GIF. React with emojis, repost, quote, and jump into the comments. <strong>For you</strong> is the fun stuff; <strong>Friends</strong> is just your people.
            </Tip>
            <Composer />
            {list.length ? (
              <div key={tab} className="stagger space-y-3">
                {list.map((p, i) => (
                  <div key={p.id} style={{ ["--i" as string]: Math.min(i, 6) }}>
                    <PostCard post={p} quoted={p.quoteOf ? byId.get(p.quoteOf) : undefined} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<UsersRound className="h-5 w-5" />}
                title="No posts from friends yet"
                body="Add creators and brands as friends from Search or their profile, and their posts show up here."
                action={<Link href="/explore" className="inline-flex h-11 items-center rounded-full bg-brand-50 px-5 text-sm font-semibold text-brand-700 hover:bg-brand-100">Find friends</Link>}
              />
            )}
          </>
        )}
      </div>

      <aside className="hidden md:block" aria-label="Your summary">
        <div className="sticky top-24 space-y-4">
          <div className="lg:hidden"><TabletQuickCards /></div>
          <div className="hidden space-y-4 lg:block">
            <GrowthCard />
            <ProgramsCard />
          </div>
        </div>
      </aside>
    </div>
  );
}
