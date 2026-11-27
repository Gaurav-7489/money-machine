"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { UsersRound } from "lucide-react";
import { Composer } from "@/components/feed/composer";
import { PostCard, type FeedPost } from "@/components/feed/post-card";
import { OpportunityList } from "@/components/opportunities";
import { GrowthCard, ProgramsCard, TabletQuickCards } from "@/components/side-panels";
import { EmptyState } from "@/components/ui";
import { useFeed } from "@/lib/feed";
import { useStore } from "@/lib/store";

const TABS = [
  { id: "foryou", label: "For You" },
  { id: "friends", label: "Following" },
  { id: "opps", label: "Opportunities" },
] as const;
type TabId = (typeof TABS)[number]["id"];

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
        <div role="tablist" aria-label="Feed" className="mb-4 flex border-b border-line">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`relative flex-1 pb-3 text-sm transition md:flex-none md:px-5 ${tab === t.id ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}>
              {t.label}
              {tab === t.id && <span className="tab-indicator absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-brand-600" />}
            </button>
          ))}
        </div>

        {tab === "opps" ? (
          <OpportunityList />
        ) : (
          <>
            <Composer />
            {list.length ? (
              <div key={tab} className="stagger space-y-5">
                {list.map((p, i) => (
                  <div key={p.id} style={{ ["--i" as string]: Math.min(i, 6) }}>
                    <PostCard post={p} quoted={p.quoteOf ? byId.get(p.quoteOf) : undefined} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<UsersRound className="h-5 w-5" />}
                title="Your following feed is empty"
                body="Follow creators and brands in Explore to see their posts here."
                action={<Link href="/explore" className="text-sm font-semibold text-brand-700">Go to Explore</Link>}
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
