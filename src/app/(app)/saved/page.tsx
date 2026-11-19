"use client";

import { TabIndicator } from "@/components/motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bookmark, BookmarkX, MessageCircle, Users } from "lucide-react";
import { Avatar } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { PostCard } from "@/components/feed/post-card";
import { ButtonLink, EmptyState, SampleTag } from "@/components/ui";
import { useFeed } from "@/lib/feed";
import { SEARCHABLE_PROFILES as SAMPLE_PROFILES } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

export default function Saved() {
  const [tab, setTab] = useState<"people" | "posts">("people");
  const { savedProfiles, starredProfiles, saved, update } = useStore();
  const { startThread } = useThreads();
  const { toast } = useFeedback();
  const router = useRouter();
  const people = SAMPLE_PROFILES.filter((p) => savedProfiles.includes(p.handle) || starredProfiles.includes(p.handle));
  const posts = useFeed().filter((p) => saved.includes(p.id));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 border-b border-line pb-4 text-[clamp(2.6rem,7vw,4.25rem)] leading-[0.9]">Saved</h1>

      <div role="tablist" aria-label="Saved items" className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl bg-surface p-1 ring-1 ring-line">
        {([["people", `Starred people (${people.length})`], ["posts", `Posts (${posts.length})`]] as const).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`press relative isolate h-10 rounded-xl text-sm font-semibold ${tab === id ? "text-surface" : "text-muted hover:text-ink"}`}
          >
            {tab === id && <TabIndicator group="saved" variant="pill" />}
            {label}
          </button>
        ))}
      </div>

      {tab === "people" &&
        (people.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {people.map((p) => (
              <li key={p.handle} className="card lift p-4">
                <Link href={`/u/${p.handle}`} className="flex items-center gap-3">
                  <Avatar name={p.name} tone={p.tone} size="md" square={p.kind === "business"} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.name}</span>
                    <span className="block truncate text-xs text-muted">{p.kind === "business" ? "Business" : "Creator"} · {p.category} · {p.city}</span>
                  </span>
                  <SampleTag />
                </Link>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => router.push(`/inbox/${startThread(p.handle)}`)} className="press btn-glow inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-aurora text-[13px] font-semibold text-on-accent">
                    <MessageCircle className="h-4 w-4" /> DM
                  </button>
                  <button
                    onClick={() => {
                      update((s) => ({ ...s, savedProfiles: s.savedProfiles.filter((h) => h !== p.handle), starredProfiles: s.starredProfiles.filter((h) => h !== p.handle) }));
                      toast(`${p.name} unstarred`, "info");
                    }}
                    className="press inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-surface text-[13px] font-semibold hover:bg-elevated"
                  >
                    <BookmarkX className="h-4 w-4" /> Unstar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-y border-line">
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No starred people yet"
              body="In Search, tap the star on any creator or brand to keep them here."
              action={<ButtonLink href="/explore" variant="soft">Go to Search</ButtonLink>}
            />
          </div>
        ))}

      {tab === "posts" &&
        (posts.length ? (
          <div className="space-y-5">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        ) : (
          <div className="border-y border-line">
            <EmptyState
              icon={<Bookmark className="h-5 w-5" />}
              title="No saved posts yet"
              body="Tap Save under any post in your feed to keep it here."
              action={<ButtonLink href="/home" variant="soft">Go to Feed</ButtonLink>}
            />
          </div>
        ))}
    </div>
  );
}
