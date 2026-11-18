"use client";

import { useCallback, useMemo } from "react";
import { ADMIN_HANDLE, BULK_DM_COOLDOWN_DAYS, EARNING_MODELS, OWNER_HANDLE, OWNER_NAME, earningShort } from "./catalog";
import { uid } from "./format";
import { filtersFromProfile, findMatches } from "./match";
import { usePostIndex } from "./search-index";
import { SAMPLE_THREADS, SEARCHABLE_PROFILES, profileByHandle, type Profile } from "./sample-data";
import { useStore } from "./store";
import type { DealOffer, Session } from "./types";

/** Top tabs in Messages. */
export type Box = "all" | "sent" | "friends" | "starred" | "trash";

export const BOXES: { id: Box; label: string; empty: { title: string; body: string } }[] = [
  { id: "all", label: "All", empty: { title: "No messages here yet", body: "Find someone in Search and tap DM." } },
  { id: "sent", label: "Sent", empty: { title: "Nothing sent yet", body: "Conversations where you've replied show up here." } },
  { id: "friends", label: "Friends", empty: { title: "No chats with friends yet", body: "Add friends from Search or their profile, then message them." } },
  { id: "starred", label: "Starred", empty: { title: "No starred conversations", body: "Tap the star inside a conversation to keep it here." } },
  { id: "trash", label: "Trash", empty: { title: "Trash is empty", body: "Conversations you delete stay here until you remove them for good." } },
];

export interface FolderDef {
  id: string;
  label: string;
  /** "mm" admin, "owner" founder, "general", or "deal" */
  kind: "mm" | "owner" | "general" | "deal";
  dealType?: string;
}

export interface ViewMessage {
  id: string;
  fromMe: boolean;
  body: string;
  gif?: string;
  deal?: DealOffer;
  /** suggested profiles (Money Machine matches message) */
  matches?: string[];
  at: string;
}

export interface ThreadView {
  id: string;
  profile: Profile;
  messages: ViewMessage[];
  preview: string;
  at: string;
  unread: boolean;
  sample: boolean;
  starred: boolean;
  trashed: boolean;
  sentByMe: boolean;
  isFriend: boolean;
  folder: string;
  dealType?: string;
  /** pinned system thread (Money Machine) */
  pinned: boolean;
}

export const MM_THREAD_ID = "t_mm";

/** The folders a user sees, in order. Creators get one folder per means of earning they chose. */
export function foldersFor(session: Session | null, extraDealTypes: string[] = []): FolderDef[] {
  const out: FolderDef[] = [{ id: "mm", label: "Money Machine", kind: "mm" }];
  if (session?.role === "creator") out.push({ id: "owner", label: OWNER_NAME, kind: "owner" });
  out.push({ id: "general", label: "General", kind: "general" });
  const chosen = session?.role === "creator" ? session.earningModels ?? [] : [];
  const types = [...chosen, ...extraDealTypes.filter((t) => !chosen.includes(t))];
  for (const id of EARNING_MODELS.map((m) => m.id).filter((m) => types.includes(m))) out.push({ id: `deal:${id}`, label: earningShort(id), kind: "deal", dealType: id });
  return out;
}

function matchesFor(session: Session, posts: Record<string, string[]>): string[] {
  return findMatches(SEARCHABLE_PROFILES, filtersFromProfile(session), 50, posts)
    .slice(0, 4)
    .map((r) => r.profile.handle);
}

export function useThreads() {
  const { session, threads, messages, readThreads, starredThreads, trashedThreads, deletedThreads, following, lastBulkDmAt, update } = useStore();
  const posts = usePostIndex();

  const all = useMemo<ThreadView[]>(() => {
    if (!session) return [];
    const role = session.role;
    const created = session.createdAt;
    const lookingFor = (session.lookingFor?.length ? session.lookingFor : session.niches) ?? [];
    const matched = matchesFor(session, posts);

    type Base = { id: string; with: string; inbound: ViewMessage[]; unreadByDefault: boolean; sample: boolean; dealType?: string };
    const base: Base[] = [
      {
        id: MM_THREAD_ID,
        with: ADMIN_HANDLE,
        unreadByDefault: true,
        sample: false,
        inbound: [
          {
            id: "mm_1",
            fromMe: false,
            body: `Welcome to Money Machine, ${session.displayName}! 🎉 This folder is your direct line to our team. We'll introduce you to ${role === "creator" ? "brands" : "creators"} that fit you, so deals get connected automatically.`,
            at: created,
          },
          {
            id: "mm_2",
            fromMe: false,
            body: matched.length
              ? `Based on your setup${lookingFor.length ? ` (${lookingFor.slice(0, 3).join(", ")})` : ""}, here are your first matches. Tap “Say hi” and we'll open the chat with an intro.`
              : `Add what you're looking for in your profile and we'll start sending you matches here.`,
            matches: matched,
            at: created,
          },
        ],
      },
      ...SAMPLE_THREADS.filter((t) => !t.role || t.role === role).map((t) => ({
        id: t.id,
        with: t.with,
        unreadByDefault: t.unread,
        sample: true,
        dealType: t.dealType,
        inbound: t.inbound.map((m, i) => ({ id: `${t.id}_${i}`, fromMe: false, body: m.body, deal: m.deal, at: m.at })),
      })),
      ...threads.map((t) => ({ id: t.id, with: t.with, unreadByDefault: false, sample: false, dealType: t.dealType, inbound: [] as ViewMessage[] })),
    ];

    const chosen = role === "creator" ? session.earningModels ?? [] : null;
    return base
      .filter((t) => !deletedThreads.includes(t.id))
      .flatMap((t) => {
        const profile = profileByHandle(t.with);
        if (!profile) return [];
        const mine: ViewMessage[] = messages.filter((m) => m.threadId === t.id).map((m) => ({ id: m.id, fromMe: true, body: m.body, gif: m.gif, deal: m.deal, at: m.createdAt }));
        const msgs = [...t.inbound, ...mine].sort((a, b) => a.at.localeCompare(b.at));
        const last = msgs[msgs.length - 1];
        const folder =
          profile.system === "admin"
            ? "mm"
            : profile.system === "owner"
              ? role === "creator" ? "owner" : "general"
              : t.dealType && (chosen === null || chosen.includes(t.dealType))
                ? `deal:${t.dealType}`
                : "general";
        const preview = last ? `${last.fromMe ? "You: " : ""}${last.deal && !last.body ? `${earningShort(last.deal.type)} offer` : last.gif && !last.body ? "GIF" : last.body}` : "No messages yet. Say hello!";
        return [
          {
            id: t.id,
            profile,
            messages: msgs,
            preview,
            at: last?.at ?? created,
            unread: t.unreadByDefault && !readThreads.includes(t.id),
            sample: t.sample,
            starred: starredThreads.includes(t.id),
            trashed: trashedThreads.includes(t.id),
            sentByMe: mine.length > 0,
            isFriend: following.includes(profile.handle),
            folder,
            dealType: t.dealType,
            pinned: profile.system === "admin",
          },
        ];
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at));
  }, [session, posts, threads, messages, readThreads, starredThreads, trashedThreads, deletedThreads, following]);

  const select = useCallback(
    (box: Box, folder: string | null) =>
      all.filter((t) => {
        if (box === "trash") return t.trashed;
        if (t.trashed) return false;
        if (folder && t.folder !== folder) return false;
        if (box === "sent") return t.sentByMe;
        if (box === "friends") return t.isFriend;
        if (box === "starred") return t.starred;
        return true;
      }),
    [all],
  );

  const folders = useMemo(() => {
    const extra = [...new Set(all.map((t) => t.dealType).filter(Boolean) as string[])];
    return foldersFor(session, session?.role === "business" ? extra : []);
  }, [all, session]);

  /** Open (or create) the conversation with a profile and return its id. */
  const startThread = useCallback(
    (handle: string, dealType?: string): string => {
      if (handle === ADMIN_HANDLE) return MM_THREAD_ID;
      const existing = all.find((t) => t.profile.handle === handle);
      if (existing) {
        if (existing.trashed) update((s) => ({ ...s, trashedThreads: s.trashedThreads.filter((x) => x !== existing.id) }));
        return existing.id;
      }
      const id = `t_u_${handle.replace(/[^a-z0-9]/gi, "_")}`;
      update((s) => ({
        ...s,
        deletedThreads: s.deletedThreads.filter((x) => x !== id),
        threads: s.threads.some((t) => t.id === id) ? s.threads : [...s.threads, { id, with: handle, dealType, createdAt: new Date().toISOString() }],
      }));
      return id;
    },
    [all, update],
  );

  /** Send one message (optionally a deal) to a thread. */
  const send = useCallback(
    (threadId: string, msg: { body: string; gif?: string; deal?: DealOffer }) => {
      update((s) => ({
        ...s,
        messages: [...s.messages, { id: uid("msg"), threadId, fromMe: true, body: msg.body, gif: msg.gif, deal: msg.deal, createdAt: new Date().toISOString() }],
        trashedThreads: s.trashedThreads.filter((x) => x !== threadId),
      }));
    },
    [update],
  );

  /** Bulk DM: one deal offer to many profiles. Allowed once every BULK_DM_COOLDOWN_DAYS. */
  const sendBulk = useCallback(
    (handles: string[], deal: DealOffer): boolean => {
      if (bulkCooldownLeft(lastBulkDmAt) > 0) return false;
      const now = new Date().toISOString();
      update((s) => {
        const threadsNext = [...s.threads];
        const msgs = [...s.messages];
        for (const h of handles) {
          const sample = SAMPLE_THREADS.find((t) => t.with === h && (!t.role || t.role === s.session?.role));
          let id = sample?.id ?? threadsNext.find((t) => t.with === h)?.id;
          if (!id) {
            id = `t_u_${h.replace(/[^a-z0-9]/gi, "_")}`;
            threadsNext.push({ id, with: h, dealType: deal.type, createdAt: now });
          }
          msgs.push({ id: uid("msg"), threadId: id, fromMe: true, body: deal.note, deal, createdAt: now });
        }
        const ids = new Set(msgs.map((m) => m.threadId));
        return { ...s, threads: threadsNext, messages: msgs, lastBulkDmAt: now, trashedThreads: s.trashedThreads.filter((x) => !ids.has(x)), deletedThreads: s.deletedThreads.filter((x) => !ids.has(x)) };
      });
      return true;
    },
    [lastBulkDmAt, update],
  );

  const unreadCount = all.filter((t) => t.unread && !t.trashed).length;

  return { all, select, folders, startThread, send, sendBulk, unreadCount, bulkDaysLeft: bulkCooldownLeft(lastBulkDmAt) };
}

/** Whole days left before another bulk DM is allowed (0 = allowed now). */
export function bulkCooldownLeft(last: string | null, now = Date.now()): number {
  if (!last) return 0;
  const ms = new Date(last).getTime() + BULK_DM_COOLDOWN_DAYS * 86_400_000 - now;
  return ms > 0 ? Math.ceil(ms / 86_400_000) : 0;
}

export { OWNER_HANDLE };
