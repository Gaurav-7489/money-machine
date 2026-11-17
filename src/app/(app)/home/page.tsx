"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Sparkles, UsersRound } from "lucide-react";
import { Avatar } from "@/components/art";
import { Composer } from "@/components/feed/composer";
import { PostCard, type FeedPost } from "@/components/feed/post-card";
import { GrowthCard, ModeSwitch, ProgramsCard, TabletQuickCards } from "@/components/side-panels";
import { EmptyState, SampleTag, StatusPill, Tip } from "@/components/ui";
import { useFeed } from "@/lib/feed";
import { usePrograms } from "@/lib/hooks";
import { SAMPLE_PROFILES, profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";

const TABS = [
  { id: "all", label: "All" },
  { id: "creators", label: "Creators" },
  { id: "businesses", label: "Businesses" },
  { id: "friends", label: "Friends" },
  { id: "opps", label: "Opportunities" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function Stories() {
  const { session } = useStore();
  return (
    <div className="no-scrollbar -mx-4 mb-4 flex gap-4 overflow-x-auto px-4 md:hidden" aria-label="Creators">
      <Link href="/create" className="flex w-16 shrink-0 flex-col items-center gap-1">
        <span className="relative">
          <Avatar name={session?.displayName ?? "You"} tone="rose" size="lg" />
          <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white ring-2 ring-canvas">
            <Plus className="h-3 w-3" strokeWidth={3} />
          </span>
        </span>
        <span className="text-[11px]">New post</span>
      </Link>
      {SAMPLE_PROFILES.map((p) => (
        <Link key={p.handle} href={`/u/${p.handle}`} className="flex w-16 shrink-0 flex-col items-center gap-1">
          <span className="rounded-full bg-gradient-to-tr from-brand-500 via-aqua to-lime p-[2px]">
            <span className="block rounded-full bg-canvas p-[2px]">
              <Avatar name={p.name} tone={p.tone} size="lg" />
            </span>
          </span>
          <span className="w-full truncate text-center text-[11px]">{p.handle}</span>
        </Link>
      ))}
    </div>
  );
}

function Opportunities() {
  const programs = usePrograms().filter((p) => p.status === "active");
  if (programs.length === 0) return <EmptyState icon={<Sparkles className="h-5 w-5" />} title="No open opportunities" body="New affiliate programs will appear here." />;
  return (
    <ul className="stagger space-y-3">
      {programs.map((p, i) => (
        <li key={p.id} style={{ ["--i" as string]: i }}>
          <Link href={`/affiliates#${p.id}`} className="card flex items-center gap-3 p-4 lift hover:border-brand-200">
            <Avatar name={p.brand} tone={profileByHandle(p.ownerHandle)?.tone ?? "violet"} size="md" square />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold">
                <span className="truncate">{p.name}</span>
                {p.sample && <SampleTag />}
              </span>
              <span className="block truncate text-sm text-muted">{p.description}</span>
              <span className="mt-1 block text-xs font-semibold text-brand-700">Earn {p.commissionPercent}% of each sale</span>
            </span>
            <StatusPill status={p.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PostList({ posts, listKey }: { posts: FeedPost[]; listKey: string }) {
  return (
    <div key={listKey} className="stagger space-y-5">
      {posts.map((p, i) => (
        <div key={p.id} style={{ ["--i" as string]: Math.min(i, 6) }}>
          <PostCard post={p} />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<TabId>("all");
  const feed = useFeed();
  const { following, session } = useStore();
  const byTab: Record<Exclude<TabId, "opps">, FeedPost[]> = {
    all: feed,
    creators: feed.filter((p) => p.authorKind === "creator"),
    businesses: feed.filter((p) => p.authorKind === "business"),
    friends: feed.filter((p) => following.includes(p.authorHandle) || p.authorHandle === session?.handle),
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_240px] lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="sr-only">Feed</h1>
        <Stories />
        <Tip id="feed-intro" title="Welcome to your feed!">
          Write something in the box below and press <strong>Publish</strong> to share it. Use the tabs to see posts from creators, businesses or your friends
          (people you follow).
        </Tip>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-muted">Account mode</span>
          <ModeSwitch className="w-60" />
        </div>
        <Composer />
        <div role="tablist" aria-label="Show posts from" className="no-scrollbar -mx-4 mb-4 flex overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative shrink-0 px-4 pb-3 pt-1 text-[15px] transition ${tab === t.id ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}
            >
              {t.label}
              {tab === t.id && <span className="tab-indicator absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-600" />}
            </button>
          ))}
        </div>

        {tab === "opps" ? (
          <Opportunities />
        ) : byTab[tab].length ? (
          <PostList posts={byTab[tab]} listKey={tab} />
        ) : tab === "friends" ? (
          <EmptyState
            icon={<UsersRound className="h-5 w-5" />}
            title="No posts from friends yet"
            body="Follow creators and businesses in Search, and their posts will show up here."
            action={<Link href="/explore" className="inline-flex h-11 items-center rounded-full bg-brand-50 px-5 text-sm font-semibold text-brand-700 hover:bg-brand-100">Find people to follow</Link>}
          />
        ) : (
          <EmptyState icon={<Sparkles className="h-5 w-5" />} title="Nothing here yet" body="Be the first to post something!" />
        )}
      </div>

      <aside className="hidden md:block" aria-label="Your summary">
        <div className="sticky top-24 space-y-4">
          <div className="lg:hidden">
            <TabletQuickCards />
          </div>
          <div className="hidden space-y-4 lg:block">
            <GrowthCard />
            <ProgramsCard />
          </div>
        </div>
      </aside>
    </div>
  );
}
