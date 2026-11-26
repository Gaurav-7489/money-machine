"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ChevronLeft, FolderX, Inbox as InboxIcon, Search } from "lucide-react";
import { ThreadList, folderIcon } from "@/components/inbox/thread-list";
import { EmptyState } from "@/components/ui";
import { folderIdFromSlug, useThreads } from "@/lib/threads";

/** One DM folder, opened: its cover, then the conversations kept inside it. */
export default function FolderPage({ params }: { params: Promise<{ folder: string }> }) {
  const { folder: slug } = use(params);
  const id = folderIdFromSlug(slug);
  const { folders, all } = useThreads();
  const [q, setQ] = useState("");
  const f = folders.find((x) => x.id === id);

  if (!f) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/inbox" className="link-draw mb-6 inline-flex items-center gap-1 text-[14px] font-medium"><ChevronLeft className="h-4 w-4" /> Messages</Link>
        <div className="border-y border-line">
          <EmptyState icon={<FolderX className="h-5 w-5" />} title="This folder isn't here" body="It may belong to a way of earning you no longer use. Your conversations are still in Messages." />
        </div>
      </div>
    );
  }

  const Icon = folderIcon(f);
  const inside = all.filter((t) => t.folder === f.id && !t.trashed);
  const needle = q.trim().toLowerCase();
  const list = inside.filter((t) => !needle || [t.profile.name, t.profile.handle, t.preview].some((s) => s.toLowerCase().includes(needle)));
  const unread = inside.filter((t) => t.unread).length;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <Link href="/inbox" className="press -ml-2 inline-flex h-9 items-center gap-1 rounded-full pl-2 pr-3.5 text-[13px] font-medium text-muted hover:bg-surface hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> Folders
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-xl font-bold tracking-tight"><Icon className="h-5 w-5 text-muted" /> {f.label}</h1>
        <p className="mt-1 text-[14px] tabular-nums text-muted">
          {inside.length} {inside.length === 1 ? "DM" : "DMs"}
          {unread > 0 && <> · <span className="font-semibold text-ink">{unread} unread</span></>}
        </p>
      </header>

      {inside.length > 3 && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <label htmlFor="folder-q" className="sr-only">Search in {f.label}</label>
          <input id="folder-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search in ${f.label}`} className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-[15px] outline-none focus:border-brand-400" />
        </div>
      )}

      {list.length ? (
        <ThreadList list={list} folders={folders} showFolder={false} inTrash={false} />
      ) : (
        <div className="border-y border-line">
          <EmptyState
            icon={<InboxIcon className="h-5 w-5" />}
            title={needle ? "No conversations match your search" : `Nothing in ${f.label} yet`}
            body={needle ? "Try another name or word." : f.kind === "deal" ? `When a brand sends you a ${f.label.toLowerCase()} offer, it lands here.` : "New conversations for this folder will appear here."}
          />
        </div>
      )}
    </div>
  );
}
