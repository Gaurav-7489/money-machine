"use client";

import Link from "next/link";
import { Bell, CheckCheck, CheckCircle2, Sparkles, Star, X } from "lucide-react";
import { useFeedback } from "@/components/feedback";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { useBadges, usePrograms } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";

export default function Notifications() {
  const badges = useBadges().filter((b) => b.earned);
  const { applications, session, programs: owned, clearedNotifications, setMany } = useStore();
  const { toast } = useFeedback();
  const programs = usePrograms();
  const name = (id: string) => programs.find((p) => p.id === id)?.name ?? "a program";
  // Messages are not repeated here: they already show in DMs. Notifications are for
  // reactions to your posts, new followers and news from Money Machine itself.
  const all = [
    ...(session ? [{ key: "mm:welcome", icon: <Sparkles className="h-4 w-4" />, text: "Welcome to Money Machine! Finish your profile so the right people find you.", when: timeAgo(session.createdAt), href: "/profile" }] : []),
    ...badges.map((b) => ({ key: `badge:${b.badge.id}`, icon: <Star className="h-4 w-4" />, text: `You earned the ${b.badge.name} badge`, when: "", href: "/badges" })),
    ...(session?.role === "creator"
      ? applications
          .filter((a) => a.creatorHandle === session.handle && (a.status === "approved" || a.status === "rejected"))
          .map((a) => ({ key: `app:${a.id}:${a.status}`, icon: <CheckCircle2 className="h-4 w-4" />, text: `Your application to ${name(a.programId)} was ${a.status}`, when: "", href: "/affiliates" }))
      : applications
          .filter((a) => a.status === "pending" && owned.some((p) => p.id === a.programId && p.ownerHandle === session?.handle))
          .map((a) => ({ key: `app:${a.id}:${a.status}`, icon: <CheckCircle2 className="h-4 w-4" />, text: `@${a.creatorHandle} applied to ${name(a.programId)}`, when: "", href: "/affiliates" }))),
  ];
  const items = all.filter((i) => !clearedNotifications.includes(i.key));

  function clearAll() {
    setMany("clearedNotifications", items.map((i) => i.key), true);
    toast(`Cleared ${items.length} notification${items.length === 1 ? "" : "s"}`, "info");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notifications"
        back="/home"
        action={items.length > 0 ? <Button variant="secondary" size="sm" onClick={clearAll}><CheckCheck className="h-4 w-4" /> Clear all</Button> : undefined}
      />
      {items.length === 0 ? (
        <div className="border-y border-line">
          <EmptyState icon={<Bell className="h-5 w-5" />} title="You're all caught up" body="Likes on your posts, new followers and news from Money Machine show up here." />
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {items.map((i) => (
            <li key={i.key} className="group flex items-center transition-colors hover:bg-surface">
              <Link href={i.href} className="flex min-w-0 flex-1 items-center gap-4 py-4 text-[15px]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line">{i.icon}</span>
                <span className="min-w-0 flex-1">{i.text}</span>
                {i.when && <span className="shrink-0 text-xs tabular-nums text-muted">{i.when}</span>}
              </Link>
              <button onClick={() => setMany("clearedNotifications", [i.key], true)} className="press ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-elevated hover:text-ink" aria-label={`Dismiss: ${i.text}`} title="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
