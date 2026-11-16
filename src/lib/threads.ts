"use client";

import { useCallback, useMemo } from "react";
import { SAMPLE_THREADS, profileByHandle, type Profile } from "./sample-data";
import { useStore } from "./store";

export type Folder = "inbox" | "unread" | "sent" | "starred" | "trash";

export const FOLDERS: { id: Folder; label: string; empty: { title: string; body: string } }[] = [
  { id: "inbox", label: "Inbox", empty: { title: "Your inbox is empty. Start a conversation!", body: "Find a creator or business in Search and tap Message." } },
  { id: "unread", label: "Unread", empty: { title: "No unread messages", body: "You're all caught up." } },
  { id: "sent", label: "Sent", empty: { title: "Nothing sent yet", body: "Conversations where you've replied show up here." } },
  { id: "starred", label: "Starred", empty: { title: "No starred conversations", body: "Tap the star inside a conversation to keep it here." } },
  { id: "trash", label: "Trash", empty: { title: "Trash is empty", body: "Conversations you delete stay here until you remove them for good." } },
];

export interface ThreadView {
  id: string;
  profile: Profile;
  /** first message from the other person (sample threads only) */
  opener?: string;
  preview: string;
  at: string;
  unread: boolean;
  sample: boolean;
  starred: boolean;
  trashed: boolean;
  sentByMe: boolean;
}

export function useThreads() {
  const { threads, messages, readThreads, starredThreads, trashedThreads, deletedThreads, update } = useStore();

  const all = useMemo<ThreadView[]>(() => {
    const base = [
      ...SAMPLE_THREADS.map((t) => ({ id: t.id, with: t.with, opener: t.preview as string | undefined, at: t.at, unreadByDefault: t.unread, sample: true })),
      ...threads.map((t) => ({ id: t.id, with: t.with, opener: undefined, at: t.createdAt, unreadByDefault: false, sample: false })),
    ];
    return base
      .filter((t) => !deletedThreads.includes(t.id))
      .flatMap((t) => {
        const profile = profileByHandle(t.with);
        if (!profile) return [];
        const mine = messages.filter((m) => m.threadId === t.id);
        const last = mine[mine.length - 1];
        return [
          {
            id: t.id,
            profile,
            opener: t.opener,
            preview: last ? `You: ${last.body}` : t.opener ?? "No messages yet. Say hello!",
            at: last?.createdAt ?? t.at,
            unread: t.unreadByDefault && !readThreads.includes(t.id),
            sample: t.sample,
            starred: starredThreads.includes(t.id),
            trashed: trashedThreads.includes(t.id),
            sentByMe: mine.length > 0,
          },
        ];
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [threads, messages, readThreads, starredThreads, trashedThreads, deletedThreads]);

  const inFolder = useCallback(
    (f: Folder) =>
      all.filter((t) => {
        if (f === "trash") return t.trashed;
        if (t.trashed) return false;
        if (f === "unread") return t.unread;
        if (f === "sent") return t.sentByMe;
        if (f === "starred") return t.starred;
        return true;
      }),
    [all],
  );

  /** Open (or create) the conversation with a profile and return its id. */
  const startThread = useCallback(
    (handle: string): string => {
      const existing = all.find((t) => t.profile.handle === handle);
      if (existing) {
        if (existing.trashed) update((s) => ({ ...s, trashedThreads: s.trashedThreads.filter((x) => x !== existing.id) }));
        return existing.id;
      }
      const id = `t_u_${handle.replace(/[^a-z0-9]/gi, "_")}`;
      update((s) => ({
        ...s,
        deletedThreads: s.deletedThreads.filter((x) => x !== id),
        threads: s.threads.some((t) => t.id === id) ? s.threads : [...s.threads, { id, with: handle, createdAt: new Date().toISOString() }],
      }));
      return id;
    },
    [all, update],
  );

  const unreadCount = all.filter((t) => t.unread && !t.trashed).length;

  return { all, inFolder, startThread, unreadCount };
}
