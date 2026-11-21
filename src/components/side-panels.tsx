"use client";

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
  const money = (v: number) => formatMoney(v, currency);
  const growth = useGrowth();
  const earned = useBadges().filter((b) => b.earned).length;
  const isBiz = kind === "spending";
  const label = isBiz ? "Profit" : "Earned";
  const summary = isBiz ? { ...income, total: growth.profit, monthly: growth.monthlyProfit, changePercent: growth.roi } : income;
  return (
    <Link href="/money" className="card lift group block p-5">
      <div className="flex items-center justify-between text-[13px] text-muted">
        <h2 className="font-text flex items-center gap-2 text-[14px] text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-600"><Wallet className="h-4 w-4" /></span>
          {isBiz ? "Grow & Scale" : "Your earnings"}
        </h2>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </div>
      <div className="mt-3 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[32px] leading-none tabular-nums">{money(summary.total)}</p>
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
          <p className="font-display text-[22px] leading-none tabular-nums text-brand-600">{earned}</p>
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
    <section className="card p-5">
      <Link href="/affiliates" className="group mb-1 flex items-center justify-between text-[13px] text-muted">
        <h2 className="font-text flex items-center gap-2 text-[14px] text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-tone-violet text-tone-violet-ink"><Link2 className="h-4 w-4" /></span>
          {title}
        </h2>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
      <ul className="mt-1">
        {showing.map(({ program, status }) => {
          const owner = profileByHandle(program.ownerHandle);
          return (
            <li key={program.id}>
              <Link href={`/affiliates#${program.id}`} className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-elevated">
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
  const currency = useCurrency();
  const money = (v: number) => formatMoney(v, currency);
  const mine = useMyPrograms();
  const earned = useBadges().filter((b) => b.earned).length;
  const { session } = useStore();
  const items = [
    kind === "income"
      ? { href: "/money", label: "Earnings", value: money(summary.total), sub: "Earned", icon: Wallet }
      : { href: "/money", label: "Grow & Scale", value: `Profit ${money(growth.profit)}`, sub: "Profit", icon: Rocket },
    { href: "/affiliates", label: "Affiliates", value: `${mine.length} program${mine.length === 1 ? "" : "s"}`, sub: "", icon: Link2 },
    { href: "/badges", label: "Badges", value: `${earned} earned`, sub: "", icon: Star },
  ];
  const tints = ["bg-brand-50 text-brand-600", "bg-tone-violet text-tone-violet-ink", "bg-tone-amber text-tone-amber-ink"];
  return (
    <div className="space-y-3">
      {items.map(({ href, label, value, icon: Icon }, i) => (
        <Link key={href} href={href} className="tile lift flex items-center gap-3 p-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tints[i % tints.length]}`}>
            <Icon className="h-5 w-5" strokeWidth={1.9} />
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

/** The friendly call to action: create a program (brands) or share a post (creators). */
export function CreateCard() {
  const { session } = useStore();
  const isBiz = session?.role === "business";
  return (
    <Link href={isBiz ? "/affiliates/new" : "/create"} className="bg-aurora-soft lift group relative block overflow-hidden rounded-[var(--radius-card)] border border-line p-5">
      <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-signal/30 blur-2xl" aria-hidden="true" />
      <p className="relative font-display text-[17px]">{isBiz ? "Create a program" : "Share a post"}</p>
      <p className="relative mt-1 text-[13px] text-muted">{isBiz ? "Invite creators to promote your brand and earn commission." : "Show your latest work and get discovered by brands."}</p>
      <span className="relative mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-on-primary">
        {isBiz ? "New program" : "New post"} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
