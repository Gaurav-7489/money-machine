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
import type { AffiliateApplication, AffiliateProgram, FinancialRecord, Message, Post, Session } from "./types";

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
}

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
};

const KEY = "mm.preview.v1";

interface StoreApi extends StoreState {
  ready: boolean;
  update: (fn: (s: StoreState) => StoreState) => void;
  toggle: (key: "liked" | "saved" | "following" | "readThreads", id: string) => void;
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — keep in memory */
    }
  }, [state, ready]);

  const update = useCallback((fn: (s: StoreState) => StoreState) => setState(fn), []);
  const toggle = useCallback((key: "liked" | "saved" | "following" | "readThreads", id: string) => {
    setState((s) => ({ ...s, [key]: s[key].includes(id) ? s[key].filter((x) => x !== id) : [...s[key], id] }));
  }, []);
  const reset = useCallback(() => setState(EMPTY), []);

  const api = useMemo(() => ({ ...state, ready, update, toggle, reset }), [state, ready, update, toggle, reset]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside <StoreProvider>");
  return v;
}
