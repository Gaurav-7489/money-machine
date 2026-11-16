"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArchiveRestore, Inbox as InboxIcon, PenSquare, Search, Star, Trash2 } from "lucide-react";
import { Avatar } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { Button, EmptyState, SampleTag, Sheet, Tip } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { SAMPLE_PROFILES } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { FOLDERS, useThreads, type Folder } from "@/lib/threads";

function NewMessage({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { startThread } = useThreads();
  const router = useRouter();
  const [q, setQ] = useState("");
  const list = SAMPLE_PROFILES.filter((p) => !q || [p.name, p.handle, p.niche].some((s) => s.toLowerCase().includes(q.toLowerCase())));
  return (
    <Sheet open={open} onClose={onClose} title="New message">
      <label htmlFor="nm-q" className="mb-1.5 block text-[13px] font-medium">Who do you want to message?</label>
      <input
        id="nm-q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type a name, e.g. FitLife"
        className="mb-3 h-11 w-full rounded-full border border-line bg-surface px-4 text-[15px] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
      <ul className="divide-y divide-line">
        {list.map((p) => (
          <li key={p.handle}>
            <button
              onClick={() => {
                const id = startThread(p.handle);
                onClose();
                router.push(`/inbox/${id}`);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-canvas"
            >
              <Avatar name={p.name} tone={p.tone} square={p.kind === "business"} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{p.name}</span>
                <span className="block truncate text-xs text-muted">@{p.handle} · {p.kind === "business" ? "Business" : "Creator"}</span>
              </span>
              <SampleTag />
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="py-6 text-center text-sm text-muted">No one matches “{q}”.</li>}
      </ul>
    </Sheet>
  );
}

function InboxInner() {
  const params = useSearchParams();
  const router = useRouter();
  const folderParam = params.get("folder") as Folder | null;
  const folder: Folder = FOLDERS.some((f) => f.id === folderParam) ? folderParam! : "inbox";
  const meta = FOLDERS.find((f) => f.id === folder)!;
  const { inFolder } = useThreads();
  const { update, toggle } = useStore();
  const { toast, confirm } = useFeedback();
  const [q, setQ] = useState("");
  const [composing, setComposing] = useState(false);

  const needle = q.trim().toLowerCase();
  const list = inFolder(folder).filter((t) => !needle || [t.profile.name, t.profile.handle, t.preview].some((s) => s.toLowerCase().includes(needle)));
  const counts = Object.fromEntries(FOLDERS.map((f) => [f.id, inFolder(f.id).length])) as Record<Folder, number>;

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

  async function emptyTrash() {
    const ids = inFolder("trash").map((t) => t.id);
    if (!ids.length) return;
    if (!(await confirm({ title: "Empty Trash?", body: `${ids.length} conversation${ids.length === 1 ? "" : "s"} will be removed for good.`, confirmLabel: "Empty Trash", danger: true }))) return;
    update((s) => ({
      ...s,
      deletedThreads: [...s.deletedThreads, ...ids],
      trashedThreads: s.trashedThreads.filter((x) => !ids.includes(x)),
      starredThreads: s.starredThreads.filter((x) => !ids.includes(x)),
      messages: s.messages.filter((m) => !ids.includes(m.threadId)),
      threads: s.threads.filter((t) => !ids.includes(t.id)),
    }));
    toast("Trash emptied", "info");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted">Chat with creators and businesses.</p>
        </div>
        <Button onClick={() => setComposing(true)}>
          <PenSquare className="h-4 w-4" /> New message
        </Button>
      </div>

      <Tip id="inbox-intro" title="Keeping messages tidy">
        Tap a conversation to open it. Inside, use the <strong>star</strong> to keep important chats in Starred, or the <strong>bin</strong> to move one to Trash.
      </Tip>

      <div role="tablist" aria-label="Folders" className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={folder === f.id}
            onClick={() => router.replace(f.id === "inbox" ? "/inbox" : `/inbox?folder=${f.id}`, { scroll: false })}
            className={`press inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium ${folder === f.id ? "bg-brand-600 text-white" : "border border-line bg-surface hover:bg-canvas"}`}
          >
            {f.label}
            {counts[f.id] > 0 && f.id !== "inbox" && (
              <span className={`rounded-full px-1.5 text-[11px] font-bold ${folder === f.id ? "bg-white/20" : "bg-canvas"}`}>{counts[f.id]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <label htmlFor="inbox-q" className="sr-only">Search messages</label>
        <input
          id="inbox-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search messages by name or text"
          className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-[15px] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      {folder === "trash" && list.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-canvas px-3 py-2 text-[13px] text-muted ring-1 ring-line">
          <span>Conversations in Trash can be restored.</span>
          <button onClick={emptyTrash} className="press rounded-full px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50">Empty Trash</button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={folder === "trash" ? <Trash2 className="h-5 w-5" /> : folder === "starred" ? <Star className="h-5 w-5" /> : <InboxIcon className="h-5 w-5" />}
            title={needle ? "No conversations match your search" : meta.empty.title}
            body={needle ? "Try another name or word." : meta.empty.body}
            action={folder === "inbox" && !needle ? <Button variant="soft" onClick={() => setComposing(true)}><PenSquare className="h-4 w-4" /> Start a conversation</Button> : undefined}
          />
        </div>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {list.map((t) => (
            <li key={t.id} className="flex items-center">
              <Link href={`/inbox/${t.id}`} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-canvas">
                <span className="relative">
                  <Avatar name={t.profile.name} tone={t.profile.tone} size="md" square={t.profile.kind === "business"} />
                  {t.unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-brand-500 ring-2 ring-surface" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`truncate text-[15px] ${t.unread ? "font-bold" : "font-semibold"}`}>{t.profile.name}</span>
                    {t.starred && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Starred" />}
                    {t.sample && <SampleTag />}
                  </span>
                  <span className={`block truncate text-sm ${t.unread ? "font-medium text-ink" : "text-muted"}`}>{t.preview}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs text-muted">{timeAgo(t.at)}</span>
                  {t.unread && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold uppercase text-white">New</span>}
                </span>
              </Link>
              {folder === "trash" && (
                <div className="flex shrink-0 gap-1 pr-3">
                  <button
                    onClick={() => {
                      toggle("trashedThreads", t.id);
                      toast("Conversation restored to Inbox");
                    }}
                    className="press grid h-10 w-10 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                    aria-label={`Restore conversation with ${t.profile.name}`}
                    title="Restore"
                  >
                    <ArchiveRestore className="h-5 w-5" />
                  </button>
                  <button onClick={() => deleteForever(t.id, t.profile.name)} className="press grid h-10 w-10 place-items-center rounded-full text-rose-600 hover:bg-rose-50" aria-label={`Delete conversation with ${t.profile.name} forever`} title="Delete forever">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-center text-xs text-muted">Sample conversations are labelled. Messages you send are saved on this device and delivered once accounts go live.</p>
      <NewMessage open={composing} onClose={() => setComposing(false)} />
    </div>
  );
}

export default function Inbox() {
  return (
    <Suspense>
      <InboxInner />
    </Suspense>
  );
}
