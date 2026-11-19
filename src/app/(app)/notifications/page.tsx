"use client";

import Link from "next/link";
import { Bell, CheckCircle2, MessageCircle, Star } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { useBadges, usePrograms } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";
import { timeAgo } from "@/lib/format";

export default function Notifications() {
  const badges = useBadges().filter((b) => b.earned);
  const { applications, session, programs: owned } = useStore();
  const programs = usePrograms();
  const name = (id: string) => programs.find((p) => p.id === id)?.name ?? "a program";
  const unread = useThreads().all.filter((t) => t.unread && !t.trashed);

  const items = [
    ...unread.map((t) => ({ key: t.id, icon: <MessageCircle className="h-4 w-4 text-brand-600" />, text: `New message from ${t.profile.name} · ${timeAgo(t.at)}`, href: `/inbox/${t.id}` })),
    ...badges.map((b) => ({ key: b.badge.id, icon: <Star className="h-4 w-4 text-amber-500" />, text: `You earned the ${b.badge.name} badge`, href: "/badges" })),
    ...(session?.role === "creator"
      ? applications
          .filter((a) => a.creatorHandle === session.handle && (a.status === "approved" || a.status === "rejected"))
          .map((a) => ({ key: a.id, icon: <CheckCircle2 className="h-4 w-4 text-brand-600" />, text: `Your application to ${name(a.programId)} was ${a.status}`, href: "/affiliates" }))
      : applications
          .filter((a) => a.status === "pending" && owned.some((p) => p.id === a.programId && p.ownerHandle === session?.handle))
          .map((a) => ({ key: a.id, icon: <CheckCircle2 className="h-4 w-4 text-brand-600" />, text: `@${a.creatorHandle} applied to ${name(a.programId)}`, href: "/affiliates" }))),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Notifications" back="/home" />
      {items.length === 0 ? (
        <div className="border-y border-line">
          <EmptyState icon={<Bell className="h-5 w-5" />} title="You're all caught up" body="New messages, badges and application updates will show up here." />
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {items.map((i) => (
            <li key={i.key}>
              <Link href={i.href} className="group flex items-center gap-4 py-4 text-[15px] transition-colors hover:bg-surface">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line">{i.icon}</span>
                <span className="flex-1">{i.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
