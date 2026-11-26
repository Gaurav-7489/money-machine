"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtSign, Check, ChevronLeft, Eye, Minus, ShieldCheck, X, Mail, MapPin, MessageCircle, Star, Tag, Trash2, Undo2, UserCheck, UserPlus, UserX } from "lucide-react";
import { Photo } from "@/components/photo";
import { nichePhoto } from "@/lib/photos";
import { Avatar, VerifiedMark } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { PostCard } from "@/components/feed/post-card";
import { priceText, rangeText } from "@/components/search/match-card";
import { priceKindsFor } from "@/lib/pricing";
import { Button, ButtonLink, EmptyState, PageHeader, SampleTag } from "@/components/ui";
import { earningLabel } from "@/lib/catalog";
import { filtersFromProfile, matchLabel, scoreProfile } from "@/lib/match";
import { usePostIndex } from "@/lib/search-index";
import { useFeed } from "@/lib/feed";
import { formatCompact } from "@/lib/format";
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
  // Same side (creator↔creator, business↔business) is a peer: no rate card or match score.
  const peer = !!session && session.role === p.kind;
  const shared = peer ? p.niches.filter((n) => (session?.niches ?? []).includes(n)) : [];
  const fitResult = session && !p.system && !peer ? scoreProfile(p, { ...filtersFromProfile(session), kind: "all" }, index) : null;
  const fit = fitResult?.percent ?? null;
  const kinds = priceKindsFor(p.earningModels);
  const isCreator = p.kind === "creator";
  const socials = Object.entries(p.socials).filter(([, v]) => v) as [string, string][];
  const SOCIAL_NAMES: Record<string, string> = { instagram: "Instagram", youtube: "YouTube", x: "X" };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Cover: the world they work in */}
      <div className="relative -mx-4 aspect-[16/10] overflow-hidden bg-elevated md:mx-0 md:aspect-[21/8] md:rounded-[22px]">
        <Photo photo={nichePhoto(p.category)} sizes="(min-width: 1024px) 1024px, 100vw" priority decorative />
        <span className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/20" aria-hidden="true" />
        <Link href={peer ? "/friends" : "/explore"} className="press glass absolute left-3 top-3 inline-flex h-9 items-center gap-1 rounded-full pl-2 pr-3.5 text-[13px] font-medium text-ink" aria-label="Back">
          <ChevronLeft className="h-4 w-4" /> {peer ? "Friends" : "Search"}
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
          <h1 className="mt-4 flex items-center gap-2 text-xl font-bold tracking-tight">
            {p.name}
            {p.verified && <span className="mt-2 self-start [&_svg]:h-6 [&_svg]:w-6"><VerifiedMark /></span>}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
            <span>@{p.handle}</span>
            <span className="rounded-full border border-line px-2 py-px text-[12px] font-medium text-ink">{isCreator ? "Creator" : "Business"}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {[p.city, p.region, p.country].filter(Boolean).join(", ")}</span>
          </p>
          <p className="mt-2 max-w-md text-sm">{p.bio}</p>
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

        {peer ? (
          <aside className="md:col-span-5 md:pt-14" aria-labelledby="peer-title">
            <div className="border-t border-line pt-3">
              <h2 id="peer-title" className="font-text text-[14px] font-semibold">{isCreator ? "Fellow creator" : "Fellow business"}</h2>
              <p className="font-display mt-5 text-xl">
                {shared.length ? `You both work in ${shared.join(" and ")}.` : `A ${isCreator ? "creator" : "business"} in ${p.niche}.`}
              </p>
              <p className="mt-4 text-[15px] text-muted">
                {isCreator
                  ? "Add them as a friend to see their posts in your Friends feed, trade notes on rates and brands, or plan a collab together."
                  : "Add them as a friend to follow their launches, compare what works with creators, or plan a co-branded campaign."}
              </p>
              <dl className="mt-6 divide-y divide-line border-y border-line text-[14px]">
                <div className="flex items-baseline justify-between gap-4 py-3.5"><dt className="text-muted">Based in</dt><dd className="text-right font-medium">{[p.city, p.region, p.country].filter(Boolean).join(", ")}</dd></div>
                <div className="flex items-baseline justify-between gap-4 py-3.5"><dt className="text-muted">Works in</dt><dd className="text-right font-medium">{p.niches.join(", ")}</dd></div>
              </dl>
            </div>
          </aside>
        ) : (
        <aside className="md:col-span-5 md:pt-14" aria-labelledby="terms-title">
          <div className="border-t border-line pt-3">
            <h2 id="terms-title" className="font-text text-[14px] font-semibold">Working together</h2>
            {fit !== null && (
              <div className="mt-5 flex items-end justify-between gap-3 border-b border-line pb-5" role="img" aria-label={`${fit}% match with you, ${matchLabel(fit)}`}>
                <p className="font-display text-5xl leading-none tabular-nums" aria-hidden="true">{fit}<span className="text-[0.5em]">%</span></p>
                <p className="text-right text-[13px] text-muted" aria-hidden="true">match with you<br /><span className="font-medium text-ink">{matchLabel(fit)}</span></p>
              </div>
            )}
            <dl className="divide-y divide-line border-b border-line text-[14px]">
              {isCreator && (
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="inline-flex items-center gap-1.5 text-muted"><Eye className="h-4 w-4" /> Monthly views</dt>
                  <dd className="font-semibold tabular-nums">{p.monthlyViews !== undefined ? formatCompact(p.monthlyViews) : "Not connected yet"}</dd>
                </div>
              )}
              {!isCreator && (
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="inline-flex items-center gap-1.5 text-muted"><ShieldCheck className="h-4 w-4" /> Sales tracking</dt>
                  <dd className="text-right font-semibold">{p.gatewayConnected ? "Payments connected" : "Not connected yet"}</dd>
                </div>
              )}
              {kinds.includes("video") && (
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-muted">{isCreator ? "Charges per video" : "Budget per video"}</dt>
                  <dd className="font-semibold tabular-nums">{priceText(p)}</dd>
                </div>
              )}
              {kinds.includes("sale") && (
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-muted">Price per sale</dt>
                  <dd className="font-semibold tabular-nums">{rangeText(p.perSaleMin, p.perSaleMax, p.currency) ?? "—"}</dd>
                </div>
              )}
              {kinds.includes("views") && (
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-muted">Price per 1,000 views</dt>
                  <dd className="font-semibold tabular-nums">{rangeText(p.perThousandMin, p.perThousandMax, p.currency) ?? "—"}</dd>
                </div>
              )}
              {(p.earningModels.includes("pr_package") || p.earningModels.includes("seeding")) && (
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-muted">Free PR package</dt>
                  <dd className="font-semibold">{isCreator ? "Happy to receive" : "Sends them"}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-muted">Works in</dt>
                <dd className="text-right font-medium">{p.niche}</dd>
              </div>
            </dl>
            {fitResult && fitResult.checks.length > 0 && (
              <details className="group/why mt-3 text-[13px]">
                <summary className="flex cursor-pointer list-none items-center gap-1 py-1 font-medium text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
                  Why {fit}%?
                  <span className="transition-transform duration-300 group-open/why:rotate-90" aria-hidden="true">›</span>
                </summary>
                <ul className="mt-1.5 space-y-1">
                  {fitResult.checks.map((c) => (
                    <li key={c.label} className="flex items-center gap-1.5">
                      {c.score === 1 ? <Check className="h-3.5 w-3.5 text-gain" /> : c.score > 0 ? <Minus className="h-3.5 w-3.5 text-accent-4" /> : <X className="h-3.5 w-3.5 text-loss" />}
                      <span>{c.label}</span>
                      <span className="text-muted">— {c.score === 1 ? "yes" : c.score > 0 ? c.note ?? "partly" : "no"}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
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
        )}
      </div>

      <section className="mt-16" aria-labelledby="posts-title">
        <h2 id="posts-title" className="flex items-baseline gap-3 border-b border-line pb-3 text-lg font-semibold">
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
