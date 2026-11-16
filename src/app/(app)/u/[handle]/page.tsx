"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Bookmark, BookmarkCheck, Mail, MapPin, MessageCircle, Tag, UserCheck, UserPlus, UserX } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { PostCard } from "@/components/feed/post-card";
import { priceText } from "@/components/search/match-card";
import { Button, ButtonLink, EmptyState, InfoTip, PageHeader, SampleTag } from "@/components/ui";
import { earningLabel } from "@/lib/catalog";
import { useFeed } from "@/lib/feed";
import { formatINR } from "@/lib/format";
import { profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

export default function PublicProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  const p = profileByHandle(decodeURIComponent(handle));
  const { session, following, savedProfiles, toggle } = useStore();
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
        <div className="card">
          <EmptyState icon={<UserX className="h-5 w-5" />} title="We couldn't find this profile" body="Check the username, or find people in Search." action={<ButtonLink href="/explore" variant="soft">Go to Search</ButtonLink>} />
        </div>
      </div>
    );
  }

  const isFollowing = following.includes(p.handle);
  const isSaved = savedProfiles.includes(p.handle);
  const isCreator = p.kind === "creator";
  const socials = Object.entries(p.socials).filter(([, v]) => v) as [string, string][];
  const SOCIAL_NAMES: Record<string, string> = { instagram: "Instagram", youtube: "YouTube", x: "X" };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={p.name} back="/explore" action={<SampleTag />} />
      <section className="card p-5">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar name={p.name} tone={p.tone} size="xl" square={!isCreator} />
          <div className="mt-3 min-w-0 flex-1 sm:ml-5 sm:mt-0">
            <h2 className="flex items-center justify-center gap-1.5 text-xl font-bold sm:justify-start">
              {p.name} {p.verified && <VerifiedMark />}
            </h2>
            <p className="text-sm text-muted">@{p.handle}</p>
            <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${isCreator ? "bg-rose-50 text-rose-700" : "bg-violet-50 text-violet-700"}`}>{isCreator ? "Creator" : "Business"}</span>
            <p className="mt-3 text-[15px]">{p.bio}</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted sm:justify-start">
              <li className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {p.city}, {p.country}</li>
              <li className="flex items-center gap-1.5"><Tag className="h-4 w-4" /> {p.category} · {p.niche}</li>
            </ul>
            {socials.length > 0 && (
              <ul className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start" aria-label="Social media">
                {socials.map(([k, v]) => (
                  <li key={k} className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-xs ring-1 ring-line">
                    <AtSign className="h-3 w-3" /> {SOCIAL_NAMES[k] ?? k}: <span className="font-semibold">{v}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button
            onClick={() => {
              const id = startThread(p.handle);
              router.push(`/inbox/${id}`);
            }}
          >
            <MessageCircle className="h-4 w-4" /> Message
          </Button>
          <Button
            variant={isFollowing ? "secondary" : "soft"}
            aria-pressed={isFollowing}
            onClick={() => {
              toggle("following", p.handle);
              toast(isFollowing ? `You unfollowed ${p.name}` : `You're now following ${p.name}`, isFollowing ? "info" : "success");
            }}
          >
            {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />} {isFollowing ? "Following" : "Follow"}
          </Button>
          <Button
            variant="secondary"
            aria-pressed={isSaved}
            onClick={() => {
              toggle("savedProfiles", p.handle);
              toast(isSaved ? `${p.name} removed from Saved` : `${isCreator ? "Creator" : "Business"} saved successfully!`, isSaved ? "info" : "success");
            }}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4 text-amber-600" /> : <Bookmark className="h-4 w-4" />} {isSaved ? "Saved" : "Save"}
          </Button>
          {p.email ? (
            <ButtonLink variant="secondary" href={`mailto:${p.email}?subject=${encodeURIComponent("Collaboration via Money Machine")}`}>
              <Mail className="h-4 w-4" /> Email
            </ButtonLink>
          ) : (
            <span className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-dashed border-line text-[13px] text-muted" title="This profile hasn't shared an email">
              <Mail className="h-4 w-4" /> No email
            </span>
          )}
        </div>
      </section>

      <section className="card mt-4 p-5">
        <h3 className="mb-3 flex items-center gap-1 font-bold">
          Working together <InfoTip text="What this profile usually charges or pays. Prices are in Indian rupees (₹) and are shared by the profile, not checked by Money Machine." />
        </h3>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-canvas p-3">
            <dt className="text-xs text-muted">{isCreator ? "Charges per post" : "Budget per post"}</dt>
            <dd className="mt-0.5 font-bold">{priceText(p)}</dd>
          </div>
          <div className="rounded-2xl bg-canvas p-3">
            <dt className="text-xs text-muted">{isCreator ? "Asks per sale" : "Pays per sale"}</dt>
            <dd className="mt-0.5 font-bold">{p.perSale !== undefined ? formatINR(p.perSale) : "Not offered"}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Open to:</p>
        <p className="mt-1 flex flex-wrap gap-1.5">
          {p.earningModels.map((m) => (
            <span key={m} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">{earningLabel(m)}</span>
          ))}
        </p>
      </section>

      <h3 className="mb-3 mt-6 font-bold">Posts <span className="text-sm font-normal text-muted">· {posts.length}</span></h3>
      {posts.length ? (
        <div className="space-y-5">
          {posts.map((x) => <PostCard key={x.id} post={x} />)}
        </div>
      ) : (
        <div className="card">
          <EmptyState icon={<Tag className="h-5 w-5" />} title="No posts yet" body={`${p.name} hasn't posted anything yet.`} />
        </div>
      )}
    </div>
  );
}
