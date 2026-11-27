"use client";

import { useEffect, useRef, useState } from "react";

type Counts = { active: number; joined: number };

function visitorId() {
  try {
    let id = sessionStorage.getItem("mm-visitor");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("mm-visitor", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Live numbers: people on the site right now, and people who have joined. Refreshes every 10 seconds while the tab is visible. */
export function LiveMonitor() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [offline, setOffline] = useState(false);
  const id = useRef<string | null>(null);

  useEffect(() => {
    id.current = visitorId();
    let stopped = false;
    async function beat() {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/live", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: id.current }) });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Counts;
        if (!stopped) {
          setCounts({ active: data.active, joined: data.joined });
          setOffline(false);
        }
      } catch {
        if (!stopped) setOffline(true);
      }
    }
    void beat();
    const timer = setInterval(beat, 10_000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);

  const n = (v: number | undefined) => (v === undefined ? "–" : v.toLocaleString());
  return (
    <section aria-label="Live activity" className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">
        <span className="relative flex h-2.5 w-2.5">
          <span className={`absolute inline-flex h-full w-full rounded-full ${offline ? "bg-muted" : "animate-ping bg-brand-500 opacity-70"}`} />
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${offline ? "bg-muted" : "bg-brand-500"}`} />
        </span>
        {offline ? "Reconnecting…" : "Live"}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-4" aria-live="polite">
        <div>
          <dd key={counts?.active} className="animate-pop font-display text-4xl font-bold leading-none tabular-nums">{n(counts?.active)}</dd>
          <dt className="mt-1.5 text-[13px] text-muted">active on the site right now</dt>
        </div>
        <div className="border-l border-line pl-4">
          <dd key={counts?.joined} className="animate-pop font-display text-4xl font-bold leading-none tabular-nums">{n(counts?.joined)}</dd>
          <dt className="mt-1.5 text-[13px] text-muted">people have joined</dt>
        </div>
      </dl>
    </section>
  );
}
