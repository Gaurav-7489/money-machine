"use client";

import { programPayText } from "@/lib/pricing";
import Link from "next/link";
import { ArrowRight, ChevronRight, Link2, Rocket, Star, Wallet } from "lucide-react";
import { Avatar } from "./art";
import { Sparkline } from "./sparkline";
import { SampleTag, StatusPill } from "./ui";
import { formatMoney } from "@/lib/format";
import { useBadges, useCurrency, useGrowth, useMoney, useMyPrograms, usePrograms } from "@/lib/hooks";
import { profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";

export function GrowthCard() {
  const { kind, summary: income } = useMoney();
  const currency = useCurrency();
  const growth = useGrowth();
  const earned = useBadges().filter((b) => b.earned).length;
  const isBiz = kind === "spending";
  const label = isBiz ? "Profit" : "Income";
  const summary = isBiz ? { ...income, total: growth.profit, monthly: growth.monthlyProfit, changePercent: growth.roi } : income;
  return (
    <Link href="/money" className="card block p-4 lift hover:border-brand-200">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-normal">{isBiz ? "Grow & Scale" : "Your Growth"}</h2>
        <ChevronRight className="h-4 w-4 text-muted" />
      </div>
      <div className="flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <Sparkline values={summary.monthly.map((m) => m.total)} className="h-10 w-full" />
          <p className="mt-1 text-xl font-bold tabular-nums">{formatMoney(summary.total, currency)}</p>
          <p className="flex items-center gap-2 text-xs text-muted">
            {label}
            {summary.changePercent !== null && (
              <span className={`rounded-full px-1.5 py-0.5 font-semibold ${summary.changePercent >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {summary.changePercent >= 0 ? "+" : ""}
                {summary.changePercent}%
              </span>
            )}
          </p>
        </div>
        <div className="border-l border-line pl-4 text-center">
          <Star className="mx-auto h-7 w-7 fill-amber-300 text-amber-400" />
          <p className="mt-1 text-lg font-bold">{earned}</p>
          <p className="text-xs text-muted">Badges</p>
        </div>
      </div>
      {summary.total === 0 && <p className="mt-3 text-xs text-muted">Add your first {isBiz ? "spending" : "income"} record to start tracking.</p>}
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
    <section className="card p-4">
      <Link href="/affiliates" className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-normal">{title}</h2>
        <ChevronRight className="h-4 w-4 text-muted" />
      </Link>
      <ul className="space-y-3">
        {showing.map(({ program, status }) => {
          const owner = profileByHandle(program.ownerHandle);
          return (
            <li key={program.id}>
              <Link href={`/affiliates#${program.id}`} className="flex items-center gap-3">
                <Avatar name={program.brand} tone={owner?.tone ?? "violet"} square />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{program.name}</span>
                  <span className="block text-xs text-muted">{programPayText(program)}</span>
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
  const currency = useCurrency();
  const mine = useMyPrograms();
  const earned = useBadges().filter((b) => b.earned).length;
  const isBiz = kind === "spending";
  const items = [
    { href: "/money", label: isBiz ? "Grow & Scale" : "Money", value: formatMoney(isBiz ? growth.profit : summary.total, currency), icon: isBiz ? Rocket : Wallet, tone: "bg-emerald-50 text-emerald-600" },
    { href: "/affiliates", label: "Affiliates", value: `${mine.length} Program${mine.length === 1 ? "" : "s"}`, icon: Link2, tone: "bg-violet-50 text-violet-600" },
    { href: "/badges", label: "Badges", value: `${earned} Earned`, icon: Star, tone: "bg-amber-50 text-amber-500" },
  ];
  return (
    <div className="space-y-3">
      {items.map(({ href, label, value, icon: Icon, tone }) => (
        <Link key={href} href={href} className="card flex items-center gap-3 p-3.5 lift hover:border-brand-200">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{label}</span>
            <span className="block truncate text-xs text-muted">{value}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      ))}
      <CreateCard />
    </div>
  );
}

export function CreateCard() {
  const { session } = useStore();
  const isBiz = session?.role === "business";
  return (
    <Link href={isBiz ? "/affiliates/new" : "/create"} className="block rounded-[var(--radius-card)] bg-gradient-to-br from-brand-50 via-aqua/20 to-violet-100 p-4 transition hover:brightness-[1.02]">
      <div className="flex items-start justify-between">
        <p className="font-semibold">{isBiz ? "Create a Program" : "Share a Post"}</p>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">{isBiz ? "Invite creators to an affiliate program and grow your brand." : "Show brands what you create and get discovered."}</p>
    </Link>
  );
}
