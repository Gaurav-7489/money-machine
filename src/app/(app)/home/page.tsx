"use client";

import { TabIndicator } from "@/components/motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Plus, UsersRound } from "lucide-react";
import { Photo } from "@/components/photo";
import { nichePhoto } from "@/lib/photos";
import { Avatar } from "@/components/art";
import { Composer } from "@/components/feed/composer";
import { PostCard, type FeedPost } from "@/components/feed/post-card";
import { OpportunityList } from "@/components/opportunities";
import { CreateCard, GrowthCard, ProgramsCard, TabletQuickCards } from "@/components/side-panels";
import { EmptyState } from "@/components/ui";
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
    <section className="mb-6" aria-labelledby="matched-title">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="matched-title" className="font-text text-[15px]">Matched for you ✨</h2>
        <Link href="/explore" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700">See all</Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        <Link href="/create" className="press group flex aspect-[3/4] w-[104px] shrink-0 snap-start flex-col justify-between rounded-[20px] border-2 border-dashed border-brand-200 bg-brand-50/60 p-2.5 hover:border-brand-400">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-signal text-on-signal"><Plus className="h-4 w-4" strokeWidth={2.6} /></span>
          <span className="text-[13px] font-medium leading-tight">New post</span>
        </Link>
        {list.map(({ profile: p, percent }) => (
          <Link key={p.handle} href={`/u/${p.handle}`} className="group relative aspect-[3/4] w-[104px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-elevated" aria-label={`${p.name}${percent !== null ? `, ${percent}% match` : ""}`}>
            <Photo photo={nichePhoto(p.category)} sizes="104px" className="photo-zoom" decorative />
            <span className="photo-shade absolute inset-0" aria-hidden="true" />
            {percent !== null && <span className="absolute left-2 top-2 rounded-full bg-signal px-1.5 py-px text-[11px] font-semibold tabular-nums text-on-signal">{percent}%</span>}
            <span className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 text-white">
              <Avatar name={p.name} tone={p.tone} size="xs" square={p.kind === "business"} />
              <span className="truncate text-[12px] font-medium">{p.name.split(" ")[0]}</span>
            </span>
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
        <div role="tablist" aria-label="Feed" className="glass sticky top-[57px] z-20 -mx-4 mb-5 flex gap-6 border-b border-line px-4 md:top-[69px] md:mx-0 md:px-1">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`relative py-3 text-[15px] transition-colors ${tab === t.id ? "font-semibold text-brand-700" : "text-muted hover:text-ink"}`}>
              {t.label}
              {tab === t.id && <TabIndicator group="feed" />}
            </button>
          ))}
        </div>

        {tab === "opps" ? (
          <OpportunityList />
        ) : (
          <>
            <Composer />
            {list.length ? (
              <div key={tab} className="stagger">
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
                action={<Link href="/explore" className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary">Find friends <ArrowRight className="h-4 w-4" /></Link>}
              />
            )}
          </>
        )}
      </div>

      <aside className="hidden md:block" aria-label="Your summary">
        <div className="sticky top-28 space-y-4">
          <div className="lg:hidden"><TabletQuickCards /></div>
          <div className="hidden space-y-4 lg:block">
            <GrowthCard />
            <ProgramsCard />
            <CreateCard />
          </div>
        </div>
      </aside>
    </div>
  );
}
