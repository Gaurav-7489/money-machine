"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Link2, Rocket, Star, Wallet } from "lucide-react";
import { Avatar } from "./art";
import { Sparkline } from "./sparkline";
import { SampleTag, StatusPill } from "./ui";
import { formatINR } from "@/lib/format";
import { useBadges, useGrowth, useMoney, useMyPrograms, usePrograms } from "@/lib/hooks";
import { profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";

export function GrowthCard() {
  const { kind, summary: income } = useMoney();
  const growth = useGrowth();
  const earned = useBadges().filter((b) => b.earned).length;
  const isBiz = kind === "spending";
  const label = isBiz ? "Profit" : "Earned";
  const summary = isBiz ? { ...income, total: growth.profit, monthly: growth.monthlyProfit, changePercent: growth.roi } : income;
  return (
    <Link href="/money" className="group block border-t border-ink pt-3">
      <div className="flex items-center justify-between text-[13px] text-muted">
        <h2 className="font-text font-medium text-ink">{isBiz ? "Grow & Scale" : "Your earnings"}</h2>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </div>
      <div className="mt-3 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[44px] leading-none tabular-nums">{formatINR(summary.total)}</p>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted">
            {label}
            {summary.changePercent !== null && (
              <span className={`font-semibold tabular-nums ${summary.changePercent >= 0 ? "text-gain" : "text-loss"}`}>
                {summary.changePercent >= 0 ? "+" : ""}
                {summary.changePercent}%
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-[28px] leading-none tabular-nums">{earned}</p>
          <p className="mt-2 text-xs text-muted">Badges</p>
        </div>
      </div>
      <Sparkline values={summary.monthly.map((m) => m.total)} className="mt-4 h-12 w-full" />
    </Link>
  );
}

export function ProgramsCard() {
  const mine = useMyPrograms();
  const all = usePrograms();
  const { session } = useStore();
  const showing = mine.length > 0 ? mine.slice(0, 3) : all.filter((p) => p.sample).slice(0, 3).map((p) => ({ program: p, status: p.status as string }));
  const title = mine.length > 0 ? (session?.role === "business" ? "Your Programs" : "Active Programs") : "Discover Programs";
  return (
    <section className="border-t border-ink pt-3">
      <Link href="/affiliates" className="group mb-1 flex items-center justify-between text-[13px] text-muted">
        <h2 className="font-text font-medium text-ink">{title}</h2>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
      <ul className="divide-y divide-line">
        {showing.map(({ program, status }) => {
          const owner = profileByHandle(program.ownerHandle);
          return (
            <li key={program.id}>
              <Link href={`/affiliates#${program.id}`} className="flex items-center gap-3 py-3 transition-opacity hover:opacity-75">
                <Avatar name={program.brand} tone={owner?.tone ?? "violet"} square />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{program.name}</span>
                  <span className="block text-xs tabular-nums text-muted">{program.commissionPercent}% commission</span>
                </span>
                {program.sample && mine.length === 0 ? <SampleTag /> : <StatusPill status={status} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function TabletQuickCards() {
  const { kind, summary } = useMoney();
  const growth = useGrowth();
  const mine = useMyPrograms();
  const earned = useBadges().filter((b) => b.earned).length;
  const { session } = useStore();
  const items = [
    kind === "income"
      ? { href: "/money", label: "Earnings", value: formatINR(summary.total), sub: "Earned", icon: Wallet }
      : { href: "/money", label: "Grow & Scale", value: `Profit ${formatINR(growth.profit)}`, sub: "Profit", icon: Rocket },
    { href: "/affiliates", label: "Affiliates", value: `${mine.length} program${mine.length === 1 ? "" : "s"}`, sub: "", icon: Link2 },
    { href: "/badges", label: "Badges", value: `${earned} earned`, sub: "", icon: Star },
  ];
  return (
    <div className="border-t border-ink">
      {items.map(({ href, label, value, icon: Icon }) => (
        <Link key={href} href={href} className="flex items-center gap-3 border-b border-line py-3 transition-opacity hover:opacity-75">
          <Icon className="h-5 w-5 shrink-0" strokeWidth={1.7} />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{label}</span>
            <span className="block truncate text-xs text-muted">{value}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      ))}
      <Link
        href={session?.role === "business" ? "/affiliates/new" : "/create"}
        className="mt-4 block rounded-[var(--radius-card)] bg-signal p-4 text-on-signal transition hover:brightness-105"
      >
        <div className="flex items-start justify-between">
          <p className="font-semibold">{session?.role === "business" ? "Create a program" : "Share a post"}</p>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-on-signal text-signal">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </div>
  );
}
