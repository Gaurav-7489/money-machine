"use client";

import { TabIndicator } from "@/components/motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArchiveRestore, BadgeCheck, Crown, Folder as FolderIcon, Handshake, Inbox as InboxIcon, Link2, MessageSquareText, PenSquare, Pin, Search, Star, Trash2 } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { Button, EmptyState, SampleTag, Sheet } from "@/components/ui";
import { earningShort } from "@/lib/catalog";
import { timeAgo } from "@/lib/format";
import { SEARCHABLE_PROFILES } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { BOXES, useThreads, type Box, type FolderDef } from "@/lib/threads";

function NewMessage({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { startThread } = useThreads();
  const router = useRouter();
  const [q, setQ] = useState("");
  const list = SEARCHABLE_PROFILES.filter((p) => !q || [p.name, p.handle, p.niche].some((s) => s.toLowerCase().includes(q.toLowerCase())));
  return (
    <Sheet open={open} onClose={onClose} title="New message">
      <label htmlFor="nm-q" className="mb-1.5 block text-[13px] font-medium">Who do you want to message?</label>
      <input id="nm-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name, e.g. FitLife" className="mb-3 h-11 w-full rounded-full border border-line bg-surface px-4 text-[15px] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
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

const FOLDER_STYLE: Record<FolderDef["kind"], { icon: typeof FolderIcon; cls: string }> = {
  mm: { icon: BadgeCheck, cls: "bg-aurora text-on-accent" },
  owner: { icon: Crown, cls: "bg-gradient-to-br from-accent-4 via-accent-3 to-accent-2 text-on-accent" },
  general: { icon: MessageSquareText, cls: "bg-elevated text-ink ring-1 ring-line" },
  deal: { icon: Handshake, cls: "bg-brand-50 text-brand-700 ring-1 ring-brand-200" },
};

function FolderCard({ f, count, unread, active, onClick }: { f: FolderDef; count: number; unread: number; active: boolean; onClick: () => void }) {
  const { icon: Icon, cls } = FOLDER_STYLE[f.kind];
  const DealIcon = f.dealType === "affiliate" ? Link2 : Icon;
  return (
    <button onClick={onClick} aria-pressed={active} className={`press relative flex w-[132px] shrink-0 flex-col items-start gap-2 rounded-2xl p-3 text-left transition-shadow ${active ? "ring-aurora" : ""} ${f.kind === "mm" || f.kind === "owner" ? cls : "card"}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${f.kind === "mm" || f.kind === "owner" ? "bg-white/20" : cls}`}>
        <DealIcon className="h-[18px] w-[18px]" />
      </span>
      <span className="w-full">
        <span className="flex items-center gap-1 truncate text-[13px] font-bold">
          {f.label}
          {f.kind === "mm" && <Pin className="h-3 w-3 shrink-0" />}
        </span>
        <span className={`block text-[11px] ${f.kind === "mm" || f.kind === "owner" ? "text-on-accent/75" : "text-muted"}`}>
          {f.kind === "mm" ? "Official · matches" : f.kind === "owner" ? "Founder outreach" : `${count} ${count === 1 ? "chat" : "chats"}`}
        </span>
      </span>
      {unread > 0 && <span className="absolute right-2.5 top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-on-danger">{unread}</span>}
    </button>
  );
}

function InboxInner() {
  const params = useSearchParams();
  const router = useRouter();
  const boxParam = params.get("box") as Box | null;
  const box: Box = BOXES.some((b) => b.id === boxParam) ? boxParam! : "all";
  const folder = params.get("folder");
  const { select, folders, all } = useThreads();
  const { update, toggle } = useStore();
  const { toast, confirm } = useFeedback();
  const [q, setQ] = useState("");
  const [composing, setComposing] = useState(false);
  const meta = BOXES.find((b) => b.id === box)!;
  const activeFolder = folders.find((f) => f.id === folder) ?? null;

  const needle = q.trim().toLowerCase();
  const list = select(box, activeFolder?.id ?? null).filter((t) => !needle || [t.profile.name, t.profile.handle, t.preview].some((s) => s.toLowerCase().includes(needle)));

  function nav(next: { box?: Box; folder?: string | null }) {
    const p = new URLSearchParams();
    const b = next.box ?? box;
    const f = next.folder === undefined ? folder : next.folder;
    if (b !== "all") p.set("box", b);
    if (f) p.set("folder", f);
    router.replace(`/inbox${p.size ? `?${p}` : ""}`, { scroll: false });
  }

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
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-[26px] font-extrabold tracking-tight">Messages</h1>
        </div>
        <Button onClick={() => setComposing(true)} aria-label="New message"><PenSquare className="h-4 w-4" /> <span className="max-sm:hidden">New</span></Button>
      </div>

      <div role="tablist" aria-label="Show" className="mb-4 grid grid-cols-5 gap-1 rounded-2xl bg-surface p-1 ring-1 ring-line">
        {BOXES.map((b) => {
          const n = select(b.id, null).filter((t) => (b.id === "all" ? t.unread : true)).length;
          return (
            <button key={b.id} role="tab" aria-selected={box === b.id} onClick={() => nav({ box: b.id, folder: b.id === "trash" ? null : undefined })} className={`press relative isolate h-10 rounded-xl text-[13px] font-semibold ${box === b.id ? "text-surface" : "text-muted hover:text-ink"}`}>
              {box === b.id && <TabIndicator group="dm-box" variant="pill" />}
              {b.label}
              {n > 0 && b.id !== "trash" && <span className={`ml-1 text-[11px] ${box === b.id ? "opacity-70" : "text-brand-600"}`}>{n}</span>}
            </button>
          );
        })}
      </div>

      {box !== "trash" && (
        <section aria-label="Folders" className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-muted">Folders</h2>
            {activeFolder && <button onClick={() => nav({ folder: null })} className="text-[13px] font-semibold text-brand-700">Show all</button>}
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
            {folders.map((f) => {
              const inF = all.filter((t) => t.folder === f.id && !t.trashed);
              return <FolderCard key={f.id} f={f} count={inF.length} unread={inF.filter((t) => t.unread).length} active={activeFolder?.id === f.id} onClick={() => nav({ folder: activeFolder?.id === f.id ? null : f.id })} />;
            })}
          </div>
        </section>
      )}

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <label htmlFor="inbox-q" className="sr-only">Search messages</label>
        <input id="inbox-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={activeFolder ? `Search in ${activeFolder.label}` : "Search messages"} className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-[15px] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
      </div>

      {box === "trash" && list.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-elevated px-3 py-2 text-[13px] text-muted ring-1 ring-line">
          <span>Conversations in Trash can be restored.</span>
          <button onClick={emptyTrash} className="press rounded-full px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50">Empty Trash</button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={box === "trash" ? <Trash2 className="h-5 w-5" /> : box === "starred" ? <Star className="h-5 w-5" /> : <InboxIcon className="h-5 w-5" />}
            title={needle ? "No conversations match your search" : activeFolder ? `Nothing in ${activeFolder.label} yet` : meta.empty.title}
            body={needle ? "Try another name or word." : activeFolder?.kind === "deal" ? `When a brand sends you a ${activeFolder.label.toLowerCase()} offer, it lands here.` : meta.empty.body}
            action={box === "all" && !needle ? <Button variant="soft" onClick={() => setComposing(true)}><PenSquare className="h-4 w-4" /> Start a conversation</Button> : undefined}
          />
        </div>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {list.map((t) => {
            const f = folders.find((x) => x.id === t.folder);
            return (
              <li key={t.id} className={`flex items-center ${t.pinned ? "bg-aurora-soft" : ""}`}>
                <Link href={`/inbox/${t.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-4 pr-2 transition-colors hover:bg-canvas/60">
                  <span className="relative">
                    <Avatar name={t.profile.name} tone={t.profile.tone} size="md" square={t.profile.kind === "business"} ring={t.pinned} />
                    {t.unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-danger ring-2 ring-surface" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`truncate text-[15px] ${t.unread ? "font-bold" : "font-semibold"}`}>{t.profile.name}</span>
                      {t.profile.verified && <VerifiedMark />}
                      {t.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-label="Pinned" />}
                      {t.starred && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Starred" />}
                    </span>
                    <span className={`block truncate text-sm ${t.unread ? "font-medium text-ink" : "text-muted"}`}>{t.preview}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1">
                      {f && !activeFolder && <span className="rounded-full bg-elevated px-1.5 py-px text-[10px] font-semibold text-muted ring-1 ring-line">{f.label}</span>}
                      {t.dealType && <span className="bg-aurora rounded-full px-1.5 py-px text-[10px] font-bold text-on-accent">{earningShort(t.dealType)}</span>}
                      {t.sample && <SampleTag />}
                    </span>
                  </span>
                  <span className="shrink-0 self-start pt-0.5 text-xs text-muted">{timeAgo(t.at)}</span>
                </Link>
                {box === "trash" ? (
                  <div className="flex shrink-0 gap-1 pr-3">
                    <button onClick={() => { toggle("trashedThreads", t.id); toast("Conversation restored"); }} className="press grid h-10 w-10 place-items-center rounded-full text-brand-700 hover:bg-brand-50" aria-label={`Restore conversation with ${t.profile.name}`} title="Restore">
                      <ArchiveRestore className="h-5 w-5" />
                    </button>
                    <button onClick={() => deleteForever(t.id, t.profile.name)} className="press grid h-10 w-10 place-items-center rounded-full text-rose-600 hover:bg-rose-50" aria-label={`Delete conversation with ${t.profile.name} forever`} title="Delete forever">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  !t.pinned && (
                    <div className="flex shrink-0 flex-col pr-2">
                      <button onClick={() => { toggle("starredThreads", t.id); toast(t.starred ? "Unstarred" : "Starred ⭐", t.starred ? "info" : "success"); }} className="press grid h-9 w-9 place-items-center rounded-full text-muted hover:text-amber-500" aria-label={t.starred ? `Unstar ${t.profile.name}` : `Star ${t.profile.name}`}>
                        <Star className={`h-4 w-4 ${t.starred ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                      <button onClick={() => { toggle("trashedThreads", t.id); toast("Moved to Trash", "info"); }} className="press grid h-9 w-9 place-items-center rounded-full text-muted hover:text-rose-600" aria-label={`Move ${t.profile.name} to Trash`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}
              </li>
            );
          })}
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
