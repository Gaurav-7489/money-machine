"use client";

/**
 * Preview data store.
 *
 * Until the PostgreSQL + auth backend is connected (see docs/PLAN.md), all
 * user-entered data is kept in this browser's localStorage and is labelled in
 * the UI as "saved on this device". It is never sent anywhere and is never
 * presented as verified.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AffiliateApplication, AffiliateProgram, Comment, FinancialRecord, Message, Opportunity, Post, Session, Thread } from "./types";

interface StoreState {
  session: Session | null;
  records: FinancialRecord[];
  programs: AffiliateProgram[];
  applications: AffiliateApplication[];
  posts: Post[];
  messages: Message[];
  liked: string[];
  saved: string[];
  following: string[];
  readThreads: string[];
  /** profile handles the user saved from Search ("Saved" page) */
  savedProfiles: string[];
  /** posts the user reposted to their profile */
  reposts: string[];
  comments: Comment[];
  /** conversations started by the user */
  threads: Thread[];
  starredThreads: string[];
  /** threads moved to Trash (restorable) */
  trashedThreads: string[];
  /** threads permanently deleted from Trash */
  deletedThreads: string[];
  /** onboarding tips the user has closed */
  dismissedTips: string[];
  /** profiles starred from Search or a profile page */
  starredProfiles: string[];
  /** profiles removed from Search results ("Remove"); restorable */
  hiddenProfiles: string[];
  /** emoji reaction per post id */
  reactions: Record<string, string>;
  /** opportunities the business posted */
  opportunities: Opportunity[];
  /** opportunity ids the creator applied to */
  oppApplied: string[];
  /** ISO time of the last bulk DM (one every BULK_DM_COOLDOWN_DAYS) */
  lastBulkDmAt: string | null;
}

export type ListKey = "liked" | "saved" | "following" | "readThreads" | "savedProfiles" | "reposts" | "starredThreads" | "trashedThreads" | "deletedThreads" | "dismissedTips" | "starredProfiles" | "hiddenProfiles" | "oppApplied";

const EMPTY: StoreState = {
  session: null,
  records: [],
  programs: [],
  applications: [],
  posts: [],
  messages: [],
  liked: [],
  saved: [],
  following: [],
  readThreads: [],
  savedProfiles: [],
  reposts: [],
  comments: [],
  threads: [],
  starredThreads: [],
  trashedThreads: [],
  deletedThreads: [],
  dismissedTips: [],
  starredProfiles: [],
  hiddenProfiles: [],
  reactions: {},
  opportunities: [],
  oppApplied: [],
  lastBulkDmAt: null,
};

const KEY = "mm.preview.v1";

interface StoreApi extends StoreState {
  ready: boolean;
  update: (fn: (s: StoreState) => StoreState) => void;
  toggle: (key: ListKey, id: string) => void;
  /** add (on=true) or remove (on=false) many ids at once */
  setMany: (key: ListKey, ids: string[], on: boolean) => void;
  /** false when the last save to this device failed (e.g. storage full) */
  saveOk: boolean;
  reset: () => void;
}

const Ctx = createContext<StoreApi | null>(null);

function load(): StoreState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<StoreState>) };
  } catch {
    return EMPTY;
  }
}

export type { StoreState };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(EMPTY);
  const [ready, setReady] = useState(false);
  const [saveOk, setSaveOk] = useState(true);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      setSaveOk(true);
    } catch {
      /* storage unavailable (private mode) or full — keep in memory */
      setSaveOk(false);
    }
  }, [state, ready]);

  const update = useCallback((fn: (s: StoreState) => StoreState) => setState(fn), []);
  const toggle = useCallback((key: ListKey, id: string) => {
    setState((s) => ({ ...s, [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id] }));
  }, []);
  const setMany = useCallback((key: ListKey, ids: string[], on: boolean) => {
    setState((s) => ({
      ...s,
      [key]: on ? [...s[key], ...ids.filter((id) => !s[key].includes(id))] : s[key].filter((x) => !ids.includes(x)),
    }));
  }, []);
  const reset = useCallback(() => setState(EMPTY), []);

  const api = useMemo(() => ({ ...state, ready, saveOk, update, toggle, setMany, reset }), [state, ready, saveOk, update, toggle, setMany, reset]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside <StoreProvider>");
  return v;
}
