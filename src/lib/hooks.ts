"use client";

import { useMemo } from "react";
import { evaluateBadges } from "./badges";
import { summarize } from "./money";
import { SAMPLE_PROGRAMS } from "./sample-data";
import { useStore } from "./store";

export function useMoney() {
  const { records, session } = useStore();
  const kind = session?.role === "business" ? "spending" : "income";
  return useMemo(() => ({ kind, summary: summarize(records, kind), records: records.filter((r) => r.kind === kind) }), [records, kind]);
}

export function useBadges() {
  const { records, programs, applications, session } = useStore();
  return useMemo(() => {
    if (!session) return [];
    return evaluateBadges({ role: session.role, handle: session.handle, records, programs: [...SAMPLE_PROGRAMS, ...programs], applications });
  }, [records, programs, applications, session]);
}

export function usePrograms() {
  const { programs } = useStore();
  return useMemo(() => [...programs, ...SAMPLE_PROGRAMS], [programs]);
}

/** Programs relevant to the signed-in user: owned (business) or applied/joined (creator). */
export function useMyPrograms() {
  const { session, applications } = useStore();
  const all = usePrograms();
  return useMemo(() => {
    if (!session) return [];
    if (session.role === "business") {
      return all.filter((p) => p.ownerHandle === session.handle).map((p) => ({ program: p, status: p.status as string }));
    }
    return applications
      .filter((a) => a.creatorHandle === session.handle && a.status !== "withdrawn")
      .map((a) => ({ program: all.find((p) => p.id === a.programId), status: a.status as string }))
      .filter((x): x is { program: NonNullable<typeof x.program>; status: string } => !!x.program);
  }, [session, applications, all]);
}
