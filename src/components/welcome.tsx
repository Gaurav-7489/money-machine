"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, BadgeCheck, Briefcase, Crown, FolderOpen, Handshake, Heart, Link2, MessageCircle, Plus, Repeat2, Search, UserRound } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme";
import { Reveal, trackPointer } from "./reveal";
import { WelcomeArt } from "./welcome-art";
import { FAQ } from "@/lib/site";
import { useStore } from "@/lib/store";

const NICHES = ["Skincare", "Fitness", "Travel", "Food", "Fashion", "Tech", "Home & decor", "Gaming", "Finance", "Parenting", "Beauty", "Wellness"];

const STEPS = {
  creator: [
    { title: "Tell us what you make", body: "Pick your niches and how you want to earn: brand deals, affiliate links, UGC or PR packages." },
    { title: "Matches come to you", body: "Brands that fit land in your DMs, already sorted into the right folder." },
    { title: "Post, get paid, track it", body: "Accept the deal, deliver, and watch every rupee add up in Earnings." },
  ],
  business: [
    { title: "Describe what you sell", body: "Your category and the kind of creators you want to work with." },
    { title: "See who actually fits", body: "Creators ranked by match %, using what they post. Select all and send one bulk DM." },
    { title: "Scale what works", body: "Post opportunities, run affiliate programs and see spend, revenue and profit together." },
  ],
} as const;

/* ── Small UI previews used inside the bento grid ─────────────────────── */

function SearchPreview() {
  const rows = [
    { i: "DL", n: "Dewdrop Labs", s: "launching our new skincare line…", p: 94, c: "bg-sky-50 text-sky-700" },
    { i: "KF", n: "Kavya Fit", s: "my morning skincare + gym bag…", p: 78, c: "bg-rose-50 text-rose-700" },
    { i: "GH", n: "Glow Habit", s: "skincare routines under ₹999", p: 71, c: "bg-amber-50 text-amber-700" },
  ];
  return (
    <div className="rounded-xl border border-line bg-canvas p-3">
      <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[13px]">
        <Search className="h-3.5 w-3.5 text-muted" />
        <span>skincare</span>
        <span className="h-4 w-px animate-pulse bg-ink" />
      </div>
      <ul className="mt-2 space-y-1">
        {rows.map((r) => (
          <li key={r.n} className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-surface">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-[10px] font-semibold ${r.c}`}>{r.i}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium">{r.n}</span>
              <span className="block truncate text-[11.5px] text-muted">
                “{r.s.split("skincare")[0]}
                <span className="mark text-ink">skincare</span>
                {r.s.split("skincare")[1]}”
              </span>
            </span>
            <span className="font-mono text-[11px] tabular-nums text-brand-600">{r.p}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FoldersPreview() {
  const rows = [
    { icon: BadgeCheck, n: "Money Machine", m: "3 new matches for you", u: 3, cls: "bg-ink text-canvas" },
    { icon: Crown, n: "Zenath Sath", m: "Founder outreach", u: 0, cls: "bg-signal" },
    { icon: Handshake, n: "Brand deals", m: "FitLife · ₹18,000 offer", u: 1, cls: "bg-brand-50 text-brand-700" },
    { icon: Link2, n: "Affiliate", m: "Glow Habit · 12% commission", u: 0, cls: "bg-elevated text-ink" },
  ];
  return (
    <ul className="space-y-1.5">
      {rows.map(({ icon: Icon, ...r }) => (
        <li key={r.n} className="flex items-center gap-3 rounded-xl border border-line bg-canvas px-3 py-2.5">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${r.cls}`}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium">{r.n}</span>
            <span className="block truncate text-[11.5px] text-muted">{r.m}</span>
          </span>
          {r.u > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent-2 px-1.5 text-[10.5px] font-semibold text-white">{r.u}</span>}
        </li>
      ))}
    </ul>
  );
}

function FeedPreview() {
  const [liked, setLiked] = useState(false);
  return (
    <div className="rounded-xl border border-line bg-canvas p-3.5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-50 text-[11px] font-semibold text-rose-700">KF</span>
        <span className="text-[13px] font-medium">Kavya Fit</span>
        <span className="text-[12px] text-muted">· 2h</span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed">Just wrapped my first paid collab through here. Contract, payout, done. 🫶</p>
      <div className="mt-3 flex items-center gap-1 text-[12px] text-muted">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label="Like (demo)"
          className={`press inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 hover:bg-surface ${liked ? "text-accent-2" : ""}`}
        >
          <Heart className={`h-4 w-4 ${liked ? "animate-pop fill-current" : ""}`} /> <span className="tabular-nums">{liked ? 129 : 128}</span>
        </button>
        <span className="inline-flex h-8 items-center gap-1.5 px-2.5"><MessageCircle className="h-4 w-4" /> 24</span>
        <span className="inline-flex h-8 items-center gap-1.5 px-2.5"><Repeat2 className="h-4 w-4" /> 9</span>
      </div>
    </div>
  );
}

function GrowthPreview() {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3.5">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Profit</span>
        <span className="text-[11.5px] font-medium text-brand-600">▲ 2.4× ROI</span>
      </div>
      <svg viewBox="0 0 240 80" className="mt-2 h-20 w-full" aria-hidden="true">
        <path d="M0 70 C 30 66, 50 58, 80 56 S 130 40, 160 34 S 210 14, 240 8" fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 4" />
        <path d="M0 72 C 30 70, 50 64, 80 60 S 130 46, 160 38 S 210 20, 240 10" fill="none" stroke="var(--color-brand-600)" strokeWidth="2" strokeLinecap="round" pathLength={1} className="draw-line" />
        <circle cx="240" cy="10" r="3.5" fill="var(--color-brand-600)" className="draw-dot" />
      </svg>
    </div>
  );
}

const BENTO = [
  { title: "Search that reads posts", body: "Look for “skincare” and find brands that post about it, even if their bio never says so. Ranked by match %.", preview: SearchPreview, span: "md:col-span-4" },
  { title: "DMs that sort themselves", body: "Brand deals, affiliate offers and PR packages each get a folder. Our team pins your matches on top.", preview: FoldersPreview, span: "md:col-span-2" },
  { title: "A feed for the work", body: "Thoughts, photos, video and GIFs. React, repost, quote, comment.", preview: FeedPreview, span: "md:col-span-3" },
  { title: "Money you can see", body: "Creators track what they earn. Businesses see spend, revenue and profit side by side.", preview: GrowthPreview, span: "md:col-span-3" },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${scrolled ? "glass border-line" : "border-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 md:px-8">
        <Link href="/" aria-label="Money Machine home"><Logo /></Link>
        <nav aria-label="Sections" className="ml-8 hidden items-center gap-1 text-[14px] text-muted md:flex">
          {[["#how", "How it works"], ["#features", "Features"], ["#faq", "FAQ"]].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-3 py-1.5 transition-colors hover:text-ink">{label}</a>
          ))}
        </nav>
        <span className="flex-1" />
        <ThemeToggle />
        <Link href="/onboarding" className="press inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13.5px] font-medium text-canvas">
          Get started
        </Link>
      </div>
    </header>
  );
}

function HowItWorks() {
  const [role, setRole] = useState<"creator" | "business">("creator");
  return (
    <section id="how" className="scroll-mt-20 border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">How it works</p>
            <h2 className="mt-3 max-w-xl text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              Two sides, <span className="font-serif italic tracking-normal">one</span> marketplace.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div role="tablist" aria-label="Show steps for" className="inline-flex rounded-full border border-line bg-canvas p-1">
              {([["creator", "Creators", UserRound], ["business", "Businesses", Briefcase]] as const).map(([k, label, Icon]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={role === k}
                  onClick={() => setRole(k)}
                  className={`relative inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition-colors ${role === k ? "text-canvas" : "text-muted hover:text-ink"}`}
                >
                  {role === k && <motion.span layoutId="how-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <Icon className="relative h-4 w-4" />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-3">
          {STEPS[role].map((s, i) => (
            <li key={`${role}-${i}`} className="animate-fade-up bg-surface p-6 md:p-8" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="font-serif text-[56px] leading-none text-brand-600">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-8 text-[18px] font-semibold tracking-[-0.02em]">{s.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Welcome() {
  const { session, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  return (
    <div className="relative overflow-x-clip">
      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="relative">
          <div className="grid-bg pointer-events-none absolute inset-0 -top-16" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-12 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-28 lg:pt-20">
            <div>
              <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-[12.5px] text-muted">
                <span className="rounded-full bg-signal px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em]">Beta</span>
                For creators &amp; the brands that need them
              </p>
              <h1 className="animate-fade-up mt-6 text-[clamp(2.75rem,8.5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] [animation-delay:60ms]">
                Brand deals that <span className="font-serif font-normal italic tracking-[-0.02em]">find</span> you.
              </h1>
              <p className="animate-fade-up mt-6 max-w-[30rem] text-[17px] leading-relaxed text-muted [animation-delay:120ms]">
                Money Machine matches creators and businesses by what they actually post, then drops the right offer into the right DM folder. No cold pitching.
              </p>
              <div className="animate-fade-up mt-9 flex flex-col gap-3 [animation-delay:180ms] sm:flex-row sm:items-center">
                <Link href="/onboarding" className="press btn-glow group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-canvas">
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <a href="#how" className="press inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 text-[15px] font-medium transition-colors hover:border-ink/25">
                  See how it works
                </a>
              </div>
              <dl className="animate-fade-up mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6 [animation-delay:240ms]">
                {[["< 1 min", "to set up"], ["4", "match levels"], ["₹0", "during beta"]].map(([v, l]) => (
                  <div key={l}>
                    <dt className="sr-only">{l}</dt>
                    <dd className="text-[22px] font-semibold tracking-[-0.03em]">{v}</dd>
                    <dd className="text-[12.5px] text-muted">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:pl-4">
              <WelcomeArt />
            </div>
          </div>
        </section>

        {/* ── Niche marquee ── */}
        <div className="marquee-wrap relative overflow-hidden border-t border-line py-5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" aria-label="Niches on Money Machine">
          <ul className="marquee gap-3">
            {[...NICHES, ...NICHES].map((n, i) => (
              <li key={i} aria-hidden={i >= NICHES.length} className="flex items-center gap-3 whitespace-nowrap text-[15px] text-muted">
                <span className="font-serif text-[22px] italic text-ink">{n}</span>
                <span className="h-1 w-1 rounded-full bg-line" />
              </li>
            ))}
          </ul>
        </div>

        <HowItWorks />

        {/* ── Features: bento ── */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-8 md:py-28">
          <Reveal className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Features</p>
            <h2 className="mt-3 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              Everything between the first DM and the <span className="font-serif font-normal italic tracking-normal">payout.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-3 md:grid-cols-6">
            {BENTO.map(({ title, body, preview: Preview, span }, i) => (
              <Reveal key={title} delay={i * 70} className={span}>
                <article onPointerMove={trackPointer} className="glow-card flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 md:p-6">
                  <div className="flex-1"><Preview /></div>
                  <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-1.5 max-w-md text-[14.5px] leading-relaxed text-muted">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="scroll-mt-20 border-t border-line" aria-labelledby="faq-title">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1fr_1.6fr] md:px-8 md:py-28">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">FAQ</p>
              <h2 id="faq-title" className="mt-3 text-[clamp(2rem,4.5vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
                Questions, <span className="font-serif font-normal italic tracking-normal">answered.</span>
              </h2>
            </Reveal>
            <Reveal delay={80} className="divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <details key={f.q} className="faq group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15.5px] font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Plus className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="pb-5 pr-8 text-[15px] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="px-4 pb-6 md:px-8">
          <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-night px-6 py-20 text-paper ring-1 ring-white/10 md:px-14 md:py-24">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_right,#000,transparent_70%)]" aria-hidden="true" />
            <div className="relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-2xl text-[clamp(2.25rem,6vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
                Your next deal is <span className="font-serif font-normal italic tracking-[-0.01em] text-signal">one match</span> away.
              </h2>
              <div className="shrink-0">
                <Link href="/onboarding" className="press group inline-flex h-12 items-center gap-2 rounded-full bg-signal px-6 text-[15px] font-medium">
                  Create your profile <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <p className="mt-3 text-[13px] opacity-60">Takes under a minute. Free during beta.</p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 text-[13px] text-muted md:flex-row md:items-center md:px-8">
        <Logo />
        <p>Collaborate. Create. Earn. · Preview build by VandLabs Studio</p>
      </footer>
    </div>
  );
}
