"use client";

import Link from "next/link";
import { Bell, CheckCircle2, Star } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { useBadges, usePrograms } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export default function Notifications() {
  const badges = useBadges().filter((b) => b.earned);
  const { applications, session, programs: owned } = useStore();
  const programs = usePrograms();
  const name = (id: string) => programs.find((p) => p.id === id)?.name ?? "a program";

  const items = [
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
        <div className="card">
          <EmptyState icon={<Bell className="h-5 w-5" />} title="You're all caught up" body="Badge awards and application updates will show up here." />
        </div>
      ) : (
        <ul className="card divide-y divide-line">
          {items.map((i) => (
            <li key={i.key}>
              <Link href={i.href} className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-canvas">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-canvas">{i.icon}</span>
                {i.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
