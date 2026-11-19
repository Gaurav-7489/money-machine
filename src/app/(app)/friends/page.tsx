"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle, Search, UserPlus, Users } from "lucide-react";
import { Photo } from "@/components/photo";
import { nichePhoto } from "@/lib/photos";
import { Avatar, VerifiedMark } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { EmptyState, PageHeader, SampleTag } from "@/components/ui";
import { SEARCHABLE_PROFILES as SAMPLE_PROFILES, type Profile } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

function PersonRow({ p, followingNow }: { p: Profile; followingNow: boolean }) {
  const { toggle } = useStore();
  const { startThread } = useThreads();
  const { toast, confirm } = useFeedback();
  const router = useRouter();

  async function follow() {
    if (followingNow) {
      if (!(await confirm({ title: `Remove ${p.name} from friends?`, body: "Their posts will no longer show in your Friends feed.", confirmLabel: "Remove friend" }))) return;
      toggle("following", p.handle);
      toast(`${p.name} removed from friends`, "info");
    } else {
      toggle("following", p.handle);
      toast(`${p.name} added to friends 🤝`);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 py-3.5 sm:flex-nowrap">
      <Link href={`/u/${p.handle}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-90">
        <Avatar name={p.name} tone={p.tone} size="md" square={p.kind === "business"} />
        <span className="min-w-0">
          <span className="flex items-center gap-1 font-semibold">
            <span className="truncate">{p.name}</span>
            {p.verified && <VerifiedMark />}
            <SampleTag className="ml-1" />
          </span>
          <span className="block truncate text-sm text-muted">@{p.handle} · {p.kind === "business" ? "Business" : "Creator"} · {p.city}</span>
        </span>
      </Link>
      <div className="flex w-full gap-2 sm:w-auto">
        {followingNow && (
          <button
            onClick={() => router.push(`/inbox/${startThread(p.handle)}`)}
            className="press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-canvas sm:flex-none"
          >
            <MessageCircle className="h-4 w-4" /> DM
          </button>
        )}
        <button
          onClick={follow}
          aria-pressed={followingNow}
          className={`press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-semibold sm:flex-none ${followingNow ? "border border-line hover:border-ink" : "bg-signal text-on-signal hover:brightness-105"}`}
        >
          {followingNow ? "Friends ✓" : <><UserPlus className="h-4 w-4" /> Add friend</>}
        </button>
      </div>
    </li>
  );
}

/** A person on your own side, as a photo card: their world, their name, one tap to add. */
function PeerCard({ p, shared }: { p: Profile; shared: string[] }) {
  const { toggle } = useStore();
  const { toast } = useFeedback();
  return (
    <li className="group relative overflow-hidden rounded-[14px] border border-line bg-surface">
      <Link href={`/u/${p.handle}`} className="block">
        <span className="relative block aspect-[4/3] overflow-hidden bg-elevated">
          <Photo photo={nichePhoto(p.category)} sizes="(min-width: 768px) 320px, 50vw" className="photo-zoom" decorative />
          <span className="photo-shade absolute inset-0" aria-hidden="true" />
          {shared.length > 0 && <span className="absolute left-2 top-2 rounded-full bg-signal px-2 py-0.5 text-[11px] font-semibold text-on-signal">Also {shared[0]}</span>}
        </span>
        <span className="flex items-center gap-2.5 p-3">
          <Avatar name={p.name} tone={p.tone} size="sm" square={p.kind === "business"} />
          <span className="min-w-0">
            <span className="flex items-center gap-1 text-[14px] font-semibold"><span className="truncate">{p.name}</span>{p.verified && <VerifiedMark />}</span>
            <span className="block truncate text-[12px] text-muted">{p.niche} · {p.city}</span>
          </span>
        </span>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={() => {
            toggle("following", p.handle);
            toast(`${p.name} added to friends 🤝`);
          }}
          className="press inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-line text-[13px] font-semibold hover:border-ink"
          aria-label={`Add ${p.name} as a friend`}
        >
          <UserPlus className="h-4 w-4" /> Add friend
        </button>
      </div>
    </li>
  );
}

export default function Friends() {
  const { following, session } = useStore();
  const [q, setQ] = useState("");
  const isBiz = session?.role === "business";
  const sideKind = isBiz ? "business" : "creator";
  const side = isBiz ? "businesses" : "creators";
  const mine = new Set((session?.niches ?? []).map((n) => n.toLowerCase()));
  const friends = SAMPLE_PROFILES.filter((p) => following.includes(p.handle));
  const needle = q.trim().toLowerCase();
  // Friends is where you find people on your own side; Explore is for the other side.
  const peers = SAMPLE_PROFILES.filter((p) => p.kind === sideKind && !following.includes(p.handle))
    .map((p) => ({ p, shared: p.niches.filter((n) => mine.has(n.toLowerCase())) }))
    .filter(({ p }) => !needle || [p.name, p.handle, p.niche, p.city, p.country, ...p.niches].some((s) => s.toLowerCase().includes(needle)))
    .sort((a, b) => b.shared.length - a.shared.length || a.p.name.localeCompare(b.p.name));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Friends" lede={isBiz ? "Meet other businesses to partner with, co-launch and share what works." : "Meet other creators to collab with, swap tips and grow together."} />

      <div className="relative mb-8">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <label htmlFor="peer-q" className="sr-only">Search {side}</label>
        <input id="peer-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${side} by name, niche or city`} className="h-13 w-full rounded-full border border-line bg-surface pl-12 pr-4 text-[16px] outline-none transition-colors hover:border-muted/60 focus:border-ink" />
      </div>

      <h2 className="font-text mb-2 text-sm font-semibold">Your friends ({friends.length})</h2>
      {friends.length ? (
        <ul className="divide-y divide-line border-y border-line">
          {friends.map((p) => <PersonRow key={p.handle} p={p} followingNow />)}
        </ul>
      ) : (
        <div className="border-y border-line">
          <EmptyState icon={<Users className="h-5 w-5" />} title="No friends yet" body={`Add ${side} below to see their posts in your Friends feed and DM them quickly.`} />
        </div>
      )}

      <section className="mt-12" aria-labelledby="peers-title">
        <h2 id="peers-title" className="mb-4 text-[clamp(2rem,5vw,3rem)]">{needle ? `${side[0]!.toUpperCase()}${side.slice(1)} matching “${q.trim()}”` : `${isBiz ? "Businesses" : "Creators"} like you`}</h2>
        {peers.length ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {peers.map(({ p, shared }) => <PeerCard key={p.handle} p={p} shared={shared} />)}
          </ul>
        ) : (
          <p className="border-y border-line py-8 text-center text-sm text-muted">{needle ? `No ${side} match “${q.trim()}”.` : `You're friends with every ${sideKind} here.`}</p>
        )}
      </section>
    </div>
  );
}
