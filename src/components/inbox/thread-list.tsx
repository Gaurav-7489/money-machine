"use client";

import Link from "next/link";
import { ArchiveRestore, BadgeCheck, Crown, Handshake, Link2, MessageSquareText, Pin, Star, Trash2 } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { SampleTag } from "@/components/ui";
import { earningShort } from "@/lib/catalog";
import { timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { FolderDef, ThreadView } from "@/lib/threads";

export function folderIcon(f: FolderDef) {
  return f.kind === "mm" ? BadgeCheck : f.kind === "owner" ? Crown : f.kind === "general" ? MessageSquareText : f.dealType === "affiliate" ? Link2 : Handshake;
}

/** Conversations as a ledger list, with star / trash / restore actions. */
export function ThreadList({ list, folders, showFolder, inTrash }: { list: ThreadView[]; folders: FolderDef[]; showFolder: boolean; inTrash: boolean }) {
  const { update, toggle } = useStore();
  const { toast, confirm } = useFeedback();

  async function deleteForever(id: string, name: string) {
    if (!(await confirm({ title: `Delete your conversation with ${name}?`, body: "It will be removed for good, including messages you sent. This can't be undone.", confirmLabel: "Delete forever", danger: true }))) return;
    update((s) => ({
      ...s,
      deletedThreads: [...s.deletedThreads, id],
      trashedThreads: s.trashedThreads.filter((x) => x !== id),
      starredThreads: s.starredThreads.filter((x) => x !== id),
      messages: s.messages.filter((m) => m.threadId !== id),
      threads: s.threads.filter((t) => t.id !== id),
    }));
    toast("Conversation deleted", "info");
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {list.map((t) => {
        const f = folders.find((x) => x.id === t.folder);
        return (
          <li key={t.id} className={`group/row flex items-center transition-colors hover:bg-surface ${t.pinned ? "bg-surface" : ""}`}>
            <Link href={`/inbox/${t.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-4 pl-2 pr-2">
              <span className="relative">
                <Avatar name={t.profile.name} tone={t.profile.tone} size="md" square={t.profile.kind === "business"} ring={t.pinned} />
                {t.unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-signal ring-2 ring-canvas" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className={`truncate text-[15px] ${t.unread ? "font-bold" : "font-semibold"}`}>{t.profile.name}</span>
                  {t.profile.verified && <VerifiedMark />}
                  {t.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-muted" aria-label="Pinned" />}
                  {t.starred && <Star className="h-3.5 w-3.5 shrink-0 fill-signal text-signal" aria-label="Starred" />}
                </span>
                <span className={`block truncate text-sm ${t.unread ? "font-medium text-ink" : "text-muted"}`}>{t.preview}</span>
                <span className="mt-1 flex flex-wrap items-center gap-1">
                  {f && showFolder && <span className="rounded-full border border-line px-1.5 py-px text-[11px] text-muted">{f.label}</span>}
                  {t.dealType && <span className="rounded-full bg-primary px-1.5 py-px text-[11px] font-semibold text-on-primary">{earningShort(t.dealType)}</span>}
                  {t.sample && <SampleTag />}
                </span>
              </span>
              <span className="shrink-0 self-start pt-0.5 text-xs tabular-nums text-muted">{timeAgo(t.at)}</span>
            </Link>
            {inTrash ? (
              <div className="flex shrink-0 gap-1 pr-3">
                <button onClick={() => { toggle("trashedThreads", t.id); toast("Conversation restored"); }} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-elevated" aria-label={`Restore conversation with ${t.profile.name}`} title="Restore">
                  <ArchiveRestore className="h-5 w-5" />
                </button>
                <button onClick={() => deleteForever(t.id, t.profile.name)} className="press grid h-10 w-10 place-items-center rounded-full text-danger hover:bg-elevated" aria-label={`Delete conversation with ${t.profile.name} forever`} title="Delete forever">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ) : (
              !t.pinned && (
                <div className="flex shrink-0 flex-col pr-2">
                  <button onClick={() => { toggle("starredThreads", t.id); toast(t.starred ? "Unstarred" : "Starred ⭐", t.starred ? "info" : "success"); }} className="press grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink" aria-label={t.starred ? `Unstar ${t.profile.name}` : `Star ${t.profile.name}`}>
                    <Star className={`h-4 w-4 ${t.starred ? "fill-signal text-signal" : ""}`} />
                  </button>
                  <button onClick={() => { toggle("trashedThreads", t.id); toast("Moved to Trash", "info"); }} className="press grid h-9 w-9 place-items-center rounded-full text-muted hover:text-danger" aria-label={`Move ${t.profile.name} to Trash`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            )}
          </li>
        );
      })}
    </ul>
  );
}
