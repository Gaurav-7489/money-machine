"use client";

import { TabIndicator } from "@/components/motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Inbox as InboxIcon, PenSquare, Pin, Search, Star, Trash2 } from "lucide-react";
import { Photo } from "@/components/photo";
import { ThreadList, folderIcon, folderPhoto } from "@/components/inbox/thread-list";
import { Avatar } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { Button, EmptyState, SampleTag, Sheet } from "@/components/ui";
import { SEARCHABLE_PROFILES } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { BOXES, folderHref, useThreads, type Box, type FolderDef, type ThreadView } from "@/lib/threads";

function NewMessage({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { startThread } = useThreads();
  const router = useRouter();
  const [q, setQ] = useState("");
  const list = SEARCHABLE_PROFILES.filter((p) => !q || [p.name, p.handle, p.niche].some((s) => s.toLowerCase().includes(q.toLowerCase())));
  return (
    <Sheet open={open} onClose={onClose} title="New message">
      <label htmlFor="nm-q" className="mb-1.5 block text-[13px] font-medium">Who do you want to message?</label>
      <input id="nm-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name, e.g. FitLife" className="mb-3 h-11 w-full rounded-full border border-line bg-surface px-4 text-[15px] outline-none focus:border-brand-400" />
      <ul className="divide-y divide-line">
        {list.map((p) => (
          <li key={p.handle}>
            <button
              onClick={() => {
                const id = startThread(p.handle);
                onClose();
                router.push(`/inbox/${id}`);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-elevated"
            >
              <Avatar name={p.name} tone={p.tone} square={p.kind === "business"} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{p.name}</span>
                <span className="block truncate text-xs text-muted">@{p.handle} · {p.kind === "business" ? "Brand" : "Creator"}</span>
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

/** A folder on the shelf: its photo, its name, who's inside and what's new. Opens the folder. */
function FolderTile({ f, threads }: { f: FolderDef; threads: ThreadView[] }) {
  const Icon = folderIcon(f);
  const unread = threads.filter((t) => t.unread).length;
  const latest = threads[0];
  const strong = f.kind === "mm" || f.kind === "owner";
  return (
    <li>
      <Link href={folderHref(f.id)} className="group relative block overflow-hidden rounded-[22px] bg-primary text-on-primary" aria-label={`${f.label}: ${threads.length} ${threads.length === 1 ? "chat" : "chats"}${unread ? `, ${unread} unread` : ""}`}>
        <span className="relative block aspect-[16/9] sm:aspect-[5/4]">
          <Photo photo={folderPhoto(f)} sizes="(min-width: 1024px) 300px, 50vw" className="photo-zoom" decorative />
          <span className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/80" aria-hidden="true" />
          {/* folder tab: always a solid chip so it reads on any photo, in either theme */}
          <span className={`absolute left-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full pl-2.5 text-[12px] font-semibold shadow-[0_2px_10px_rgb(0_0_0/0.25)] ${unread > 0 ? "pr-1" : "pr-2.5"} ${f.kind === "owner" ? "bg-signal text-on-signal" : "bg-white text-[#0f1a14]"}`}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
            {f.kind === "mm" ? "Official" : f.kind === "owner" ? "Founder" : f.kind === "deal" ? "Deals" : "Chats"}
            {f.kind === "mm" && <Pin className="h-3 w-3" />}
            {unread > 0 && (
              <span className={`ml-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${f.kind === "owner" ? "bg-[#0f1a14] text-signal" : "bg-signal text-on-signal"}`} aria-hidden="true">{unread}</span>
            )}
          </span>
          <span className="absolute inset-x-3 bottom-3">
            <span className="font-display block text-lg">{f.label}</span>
            <span className="mt-1.5 flex items-center gap-2">
              <span className="flex -space-x-1.5" aria-hidden="true">
                {threads.slice(0, 3).map((t) => (
                  <span key={t.id} className="rounded-full ring-2 ring-black/40"><Avatar name={t.profile.name} tone={t.profile.tone} size="xs" square={t.profile.kind === "business"} /></span>
                ))}
              </span>
              <span className="text-[12px] tabular-nums text-white/85">{threads.length} {threads.length === 1 ? "chat" : "chats"}</span>
            </span>
            {latest && <span className="mt-1.5 block truncate text-[12px] text-white/80">{latest.profile.name}: {latest.preview}</span>}
          </span>
        </span>
      </Link>
    </li>
  );
}

function InboxInner() {
  const params = useSearchParams();
  const router = useRouter();
  const boxParam = params.get("box") as Box | null;
  const box: Box = BOXES.some((b) => b.id === boxParam) ? boxParam! : "all";
  const legacyFolder = params.get("folder");
  const { select, folders, all } = useThreads();
  const { toast, confirm } = useFeedback();
  const { update } = useStore();
  const [q, setQ] = useState("");
  const [composing, setComposing] = useState(false);
  const meta = BOXES.find((b) => b.id === box)!;

  // Old links (?folder=…) open the folder itself now.
  useEffect(() => {
    if (legacyFolder) router.replace(folderHref(legacyFolder));
  }, [legacyFolder, router]);

  const needle = q.trim().toLowerCase();
  const list = select(box, null).filter((t) => !needle || [t.profile.name, t.profile.handle, t.preview].some((s) => s.toLowerCase().includes(needle)));
  // Messages live inside folders; a folder appears once something is in it.
  const shelf = folders.map((f) => ({ f, threads: all.filter((t) => t.folder === f.id && !t.trashed) })).filter((x) => x.threads.length > 0);
  const showShelf = box === "all" && !needle;

  function nav(next: Box) {
    router.replace(next === "all" ? "/inbox" : `/inbox?box=${next}`, { scroll: false });
  }

  async function emptyTrash() {
    const ids = select("trash", null).map((t) => t.id);
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-end gap-3">
        <h1 className="flex-1 text-xl font-bold tracking-tight">Messages</h1>
        <Button onClick={() => setComposing(true)} aria-label="New message"><PenSquare className="h-4 w-4" /> <span className="max-sm:hidden">New</span></Button>
      </div>

      <div role="tablist" aria-label="Show" className="mb-6 grid max-w-2xl grid-cols-5 gap-1 rounded-full border border-line p-1">
        {BOXES.map((b) => {
          const n = select(b.id, null).filter((t) => (b.id === "all" ? t.unread : true)).length;
          return (
            <button key={b.id} role="tab" aria-selected={box === b.id} onClick={() => nav(b.id)} className={`press relative isolate h-9 rounded-full text-[13px] font-semibold ${box === b.id ? "text-on-primary" : "text-muted hover:text-ink"}`}>
              {box === b.id && <TabIndicator group="dm-box" variant="pill" />}
              {b.id === "all" ? "Folders" : b.label}
              {n > 0 && b.id !== "trash" && <span className={`ml-1 text-[11px] tabular-nums ${box === b.id ? "opacity-70" : "text-ink"}`}>{n}</span>}
            </button>
          );
        })}
      </div>

      <div className="relative mb-6 max-w-2xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <label htmlFor="inbox-q" className="sr-only">Search messages</label>
        <input id="inbox-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all messages" className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-[15px] outline-none focus:border-brand-400" />
      </div>

      {showShelf ? (
        <section aria-label="Folders">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shelf.map(({ f, threads }) => <FolderTile key={f.id} f={f} threads={threads} />)}
          </ul>
        </section>
      ) : (
        <div className="max-w-2xl">
          {box === "trash" && list.length > 0 && (
            <div className="mb-3 flex items-center justify-between border-y border-line py-2 text-[13px] text-muted">
              <span>Conversations in Trash can be restored.</span>
              <button onClick={emptyTrash} className="press rounded-full px-3 py-1.5 font-semibold text-danger hover:bg-elevated">Empty Trash</button>
            </div>
          )}
          {list.length === 0 ? (
            <div className="border-y border-line">
              <EmptyState
                icon={box === "trash" ? <Trash2 className="h-5 w-5" /> : box === "starred" ? <Star className="h-5 w-5" /> : <InboxIcon className="h-5 w-5" />}
                title={needle ? "No conversations match your search" : meta.empty.title}
                body={needle ? "Try another name or word." : meta.empty.body}
              />
            </div>
          ) : (
            <ThreadList list={list} folders={folders} showFolder inTrash={box === "trash"} />
          )}
        </div>
      )}
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
