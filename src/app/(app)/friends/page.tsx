"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, UserPlus, Users } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { ButtonLink, EmptyState, InfoTip, SampleTag } from "@/components/ui";
import { SAMPLE_PROFILES, type Profile } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

function PersonRow({ p, followingNow }: { p: Profile; followingNow: boolean }) {
  const { toggle } = useStore();
  const { startThread } = useThreads();
  const { toast, confirm } = useFeedback();
  const router = useRouter();

  async function follow() {
    if (followingNow) {
      if (!(await confirm({ title: `Unfollow ${p.name}?`, body: "Their posts will no longer show in your Friends feed.", confirmLabel: "Unfollow" }))) return;
      toggle("following", p.handle);
      toast(`You unfollowed ${p.name}`, "info");
    } else {
      toggle("following", p.handle);
      toast(`You're now following ${p.name}`);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap">
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
            className="press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-600 px-4 text-[13px] font-semibold text-white hover:bg-brand-700 sm:flex-none"
          >
            <MessageCircle className="h-4 w-4" /> Message
          </button>
        )}
        <button
          onClick={follow}
          aria-pressed={followingNow}
          className={`press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-semibold sm:flex-none ${followingNow ? "border border-line bg-surface hover:bg-canvas" : "bg-brand-50 text-brand-700 hover:bg-brand-100"}`}
        >
          {followingNow ? "Following" : <><UserPlus className="h-4 w-4" /> Follow</>}
        </button>
      </div>
    </li>
  );
}

export default function Friends() {
  const { following } = useStore();
  const friends = SAMPLE_PROFILES.filter((p) => following.includes(p.handle));
  const suggestions = SAMPLE_PROFILES.filter((p) => !following.includes(p.handle));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="flex items-center gap-1 text-2xl font-bold tracking-tight">
        Friends <InfoTip text="Friends are the creators and businesses you follow. Their posts appear in the Friends tab of your feed." />
      </h1>
      <p className="mb-5 text-sm text-muted">People you follow, plus a few suggestions.</p>

      <h2 className="mb-2 text-sm font-semibold text-muted">You follow ({friends.length})</h2>
      {friends.length ? (
        <ul className="card divide-y divide-line">
          {friends.map((p) => <PersonRow key={p.handle} p={p} followingNow />)}
        </ul>
      ) : (
        <div className="card">
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="You're not following anyone yet"
            body="Follow creators and businesses to see their posts and message them quickly."
            action={<ButtonLink href="/explore" variant="soft">Find people in Search</ButtonLink>}
          />
        </div>
      )}

      {suggestions.length > 0 && (
        <>
          <h2 className="mb-2 mt-8 text-sm font-semibold text-muted">Suggested for you</h2>
          <ul className="card divide-y divide-line">
            {suggestions.map((p) => <PersonRow key={p.handle} p={p} followingNow={false} />)}
          </ul>
        </>
      )}
    </div>
  );
}
