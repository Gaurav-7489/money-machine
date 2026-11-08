"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Avatar } from "@/components/art";
import { PostCard } from "@/components/feed/post-card";
import { GrowthCard, ProgramsCard, TabletQuickCards } from "@/components/side-panels";
import { EmptyState, SampleTag, StatusPill } from "@/components/ui";
import { useFeed } from "@/lib/feed";
import { usePrograms } from "@/lib/hooks";
import { SAMPLE_PROFILES, profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";

const TABS = ["For You", "Following", "Opportunities"] as const;

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
        <span className="text-[11px]">Your post</span>
      </Link>
      {SAMPLE_PROFILES.map((p) => (
        <Link key={p.handle} href={`/explore?q=${p.handle}`} className="flex w-16 shrink-0 flex-col items-center gap-1">
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
              <span className="mt-1 block text-xs font-semibold text-brand-700">{p.commissionPercent}% commission</span>
            </span>
            <StatusPill status={p.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("For You");
  const feed = useFeed();
  const { following, session } = useStore();
  const followingFeed = feed.filter((p) => following.includes(p.authorHandle) || p.authorHandle === session?.handle);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_240px] lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="mx-auto w-full max-w-xl">
        <Stories />
        <div role="tablist" className="mb-4 flex border-b border-line">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative flex-1 pb-3 text-sm transition md:flex-none md:px-5 ${tab === t ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}
            >
              {t}
              {tab === t && <span className="tab-indicator absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-brand-600" />}
            </button>
          ))}
        </div>

        {tab === "For You" && (
          <div key="foryou" className="stagger space-y-5">
            {feed.map((p, i) => (
              <div key={p.id} style={{ ["--i" as string]: Math.min(i, 6) }}>
                <PostCard post={p} />
              </div>
            ))}
          </div>
        )}
        {tab === "Following" &&
          (followingFeed.length ? (
            <div key="following" className="stagger space-y-5">
              {followingFeed.map((p, i) => (
                <div key={p.id} style={{ ["--i" as string]: Math.min(i, 6) }}>
                  <PostCard post={p} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="Your following feed is empty"
              body="Follow creators and brands in Explore to see their posts here."
              action={<Link href="/explore" className="text-sm font-semibold text-brand-700">Go to Explore</Link>}
            />
          ))}
        {tab === "Opportunities" && <Opportunities />}
      </div>

      <aside className="hidden md:block">
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
