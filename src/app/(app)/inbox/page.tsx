"use client";

import Link from "next/link";
import { Avatar } from "@/components/art";
import { SampleTag } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { SAMPLE_THREADS, profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";

export default function Inbox() {
  const { readThreads, messages } = useStore();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold tracking-tight">Inbox</h1>
      <ul className="card divide-y divide-line overflow-hidden">
        {SAMPLE_THREADS.map((t) => {
          const p = profileByHandle(t.with)!;
          const last = [...messages].reverse().find((m) => m.threadId === t.id);
          const unread = t.unread && !readThreads.includes(t.id);
          return (
            <li key={t.id}>
              <Link href={`/inbox/${t.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-canvas">
                <Avatar name={p.name} tone={p.tone} size="md" square={p.kind === "business"} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate text-sm ${unread ? "font-bold" : "font-semibold"}`}>{p.name}</span>
                    <SampleTag />
                  </span>
                  <span className={`block truncate text-sm ${unread ? "text-ink" : "text-muted"}`}>{last ? `You: ${last.body}` : t.preview}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted">{timeAgo(last?.createdAt ?? t.at)}</span>
                  {unread && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-label="Unread" />}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-center text-xs text-muted">Conversations shown are samples. Real messaging starts when accounts go live.</p>
    </div>
  );
}
