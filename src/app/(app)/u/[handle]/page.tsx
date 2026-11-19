"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtSign, ChevronLeft, Mail, MapPin, MessageCircle, Star, Tag, Trash2, Undo2, UserCheck, UserPlus, UserX } from "lucide-react";
import { Photo } from "@/components/photo";
import { nichePhoto } from "@/lib/photos";
import { Avatar, VerifiedMark } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { PostCard } from "@/components/feed/post-card";
import { priceText } from "@/components/search/match-card";
import { Button, ButtonLink, EmptyState, PageHeader, SampleTag } from "@/components/ui";
import { earningLabel } from "@/lib/catalog";
import { filtersFromProfile, matchLabel, scoreProfile } from "@/lib/match";
import { usePostIndex } from "@/lib/search-index";
import { useFeed } from "@/lib/feed";
import { formatINR } from "@/lib/format";
import { profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

export default function PublicProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const p = profileByHandle(decodeURIComponent(handle));
  const { session, following, starredProfiles, hiddenProfiles, toggle } = useStore();
  const index = usePostIndex();
  const { startThread } = useThreads();
  const { toast } = useFeedback();
  const router = useRouter();
  const posts = useFeed().filter((x) => x.authorHandle === p?.handle);

  useEffect(() => {
    if (session && handle === session.handle) router.replace("/profile");
  }, [session, handle, router]);

  if (!p) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Profile" back="/explore" />
        <div className="border-y border-line">
          <EmptyState icon={<UserX className="h-5 w-5" />} title="We couldn't find this profile" body="Check the username, or find people in Search." action={<ButtonLink href="/explore" variant="soft">Go to Search</ButtonLink>} />
        </div>
      </div>
    );
  }

  const isFollowing = following.includes(p.handle);
  const isStarred = starredProfiles.includes(p.handle);
  const isHidden = hiddenProfiles.includes(p.handle);
  const fit = session && !p.system ? scoreProfile(p, { ...filtersFromProfile(session), kind: "all" }, index).percent : null;
  const isCreator = p.kind === "creator";
  const socials = Object.entries(p.socials).filter(([, v]) => v) as [string, string][];
  const SOCIAL_NAMES: Record<string, string> = { instagram: "Instagram", youtube: "YouTube", x: "X" };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Cover: the world they work in */}
      <div className="relative -mx-4 aspect-[16/10] overflow-hidden bg-elevated md:mx-0 md:aspect-[21/8] md:rounded-[16px]">
        <Photo photo={nichePhoto(p.category)} sizes="(min-width: 1024px) 1024px, 100vw" priority decorative />
        <span className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/20" aria-hidden="true" />
        <Link href="/explore" className="press glass absolute left-3 top-3 inline-flex h-9 items-center gap-1 rounded-full pl-2 pr-3.5 text-[13px] font-medium text-ink" aria-label="Back">
          <ChevronLeft className="h-4 w-4" /> Search
        </Link>
        <SampleTag className="glass absolute right-3 top-3 border-transparent text-ink" />
      </div>

      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <section className="md:col-span-7" aria-label="About">
          <div className="-mt-10 flex items-end gap-4 md:-mt-12">
            <span className="relative z-10 rounded-full bg-canvas p-1.5" style={{ borderRadius: isCreator ? undefined : "30%" }}>
              <Avatar name={p.name} tone={p.tone} size="xl" square={!isCreator} />
            </span>
          </div>
          <h1 className="mt-4 flex items-center gap-2 text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.88]">
            {p.name}
            {p.verified && <span className="mt-2 self-start [&_svg]:h-6 [&_svg]:w-6"><VerifiedMark /></span>}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
            <span>@{p.handle}</span>
            <span className="rounded-full border border-line px-2 py-px text-[12px] font-medium text-ink">{isCreator ? "Creator" : "Business"}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.city}, {p.country}</span>
          </p>
          <p className="mt-6 max-w-[34ch] text-[clamp(1.35rem,2.6vw,1.75rem)] font-medium leading-snug tracking-[-0.015em]">{p.bio}</p>
          <p className="mt-5 flex flex-wrap gap-1.5">
            {p.niches.map((n) => <span key={n} className="rounded-full bg-elevated px-3 py-1 text-[13px] font-medium">{n}</span>)}
          </p>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted" aria-label="Social media">
              {socials.map(([k, v]) => (
                <li key={k} className="inline-flex items-center gap-1">
                  <AtSign className="h-3 w-3" /> {SOCIAL_NAMES[k] ?? k} <span className="font-medium text-ink">{v}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <Button
              size="lg"
              className="min-w-[9rem] flex-1 sm:flex-none"
              onClick={() => {
                const id = startThread(p.handle);
                router.push(`/inbox/${id}`);
              }}
            >
              <MessageCircle className="h-4 w-4" /> Message
            </Button>
            <Button
              size="lg"
              variant={isFollowing ? "soft" : "secondary"}
              aria-pressed={isFollowing}
              aria-label={isFollowing ? "Remove friend" : "Add friend"}
              title={isFollowing ? "Friends" : "Add friend"}
              onClick={() => {
                toggle("following", p.handle);
                toast(isFollowing ? `${p.name} removed from friends` : `${p.name} added to friends 🤝`, isFollowing ? "info" : "success");
              }}
            >
              {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />} <span className="max-sm:hidden">{isFollowing ? "Friends" : "Add friend"}</span>
            </Button>
            <Button
              size="lg"
              variant={isStarred ? "signal" : "secondary"}
              aria-pressed={isStarred}
              aria-label={isStarred ? `Unstar ${p.name}` : `Star ${p.name}`}
              className="w-13 px-0!"
              onClick={() => {
                toggle("starredProfiles", p.handle);
                toast(isStarred ? `${p.name} unstarred` : `${p.name} starred ⭐`, isStarred ? "info" : "success");
              }}
            >
              <Star className={`h-4 w-4 ${isStarred ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              aria-label={isHidden ? `Show ${p.name} in search again` : `Remove ${p.name} from search`}
              title={isHidden ? "Show in search again" : "Remove from search"}
              className="w-13 px-0!"
              onClick={() => {
                toggle("hiddenProfiles", p.handle);
                toast(isHidden ? `${p.name} is back in your search results` : `${p.name} removed from your search results`, "info");
              }}
            >
              {isHidden ? <Undo2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </section>

        {/* Working together: the business terms, set like a rate card */}
        <aside className="md:col-span-5 md:pt-14" aria-labelledby="terms-title">
          <div className="border-t border-ink pt-3">
            <h2 id="terms-title" className="font-text text-[14px] font-semibold">Working together</h2>
            {fit !== null && (
              <div className="mt-5 flex items-end justify-between gap-3 border-b border-line pb-5" role="img" aria-label={`${fit}% match with you, ${matchLabel(fit)}`}>
                <p className="font-display text-[88px] leading-[0.8] tabular-nums" aria-hidden="true">{fit}<span className="text-[0.5em]">%</span></p>
                <p className="text-right text-[13px] text-muted" aria-hidden="true">match with you<br /><span className="font-medium text-ink">{matchLabel(fit)}</span></p>
              </div>
            )}
            <dl className="divide-y divide-line border-b border-line text-[14px]">
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-muted">{isCreator ? "Charges per video" : "Pays per video"}</dt>
                <dd className="font-semibold tabular-nums">{priceText(p)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-muted">{isCreator ? "Asks commission" : "Pays commission"}</dt>
                <dd className="text-right font-semibold tabular-nums">{p.commissionPercent !== undefined ? `${p.commissionPercent}%` : "—"}{p.perSale !== undefined ? ` · ${formatINR(p.perSale)}/sale` : ""}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-muted">Works in</dt>
                <dd className="text-right font-medium">{p.niche}</dd>
              </div>
            </dl>
            <p className="mt-5 text-[13px] text-muted">Open to</p>
            <p className="mt-2 flex flex-wrap gap-1.5">
              {p.earningModels.map((m) => (
                <span key={m} className="rounded-full border border-line px-2.5 py-1 text-[12px] font-medium">{earningLabel(m)}</span>
              ))}
            </p>
            {p.email && (
              <a href={`mailto:${p.email}?subject=${encodeURIComponent("Collaboration via Money Machine")}`} className="link-draw mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium">
                <Mail className="h-4 w-4" /> {p.email}
              </a>
            )}
          </div>
        </aside>
      </div>

      <section className="mt-16" aria-labelledby="posts-title">
        <h2 id="posts-title" className="flex items-baseline gap-3 border-b border-line pb-3 text-[clamp(2rem,5vw,3rem)]">
          Posts <span className="font-text text-[15px] font-normal text-muted tabular-nums">{posts.length}</span>
        </h2>
        {posts.length ? (
          <div className="max-w-2xl">
            {posts.map((x) => <PostCard key={x.id} post={x} />)}
          </div>
        ) : (
          <EmptyState icon={<Tag className="h-5 w-5" />} title="No posts yet" body={`${p.name} hasn't posted anything yet.`} />
        )}
      </section>
    </div>
  );
}
