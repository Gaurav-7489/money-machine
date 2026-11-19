"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate } from "motion/react";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { Logo } from "./logo";
import { Photo } from "./photo";
import { ThemeToggle } from "./theme";
import { useLandingMotion } from "./landing-motion";
import { FAQ } from "@/lib/site";
import { NICHE_PHOTOS, STORY, type Photo as PhotoT } from "@/lib/photos";
import { useStore } from "@/lib/store";

/* ── Content ──────────────────────────────────────────────────────────── */

const CREATOR_STACK = [STORY.creatorStudio, STORY.creatorHat, STORY.creatorPortrait];
const BRAND_STACK = [STORY.team, STORY.rack, STORY.shop];

const MANIFESTO =
  "Most brand deals start with a cold DM and end in a spreadsheet. Money Machine reads what you actually post, puts the businesses that fit in your inbox, sorts every offer into its own folder and keeps the ledger for you.";

const SIDES = [
  {
    id: "creators",
    title: "For creators",
    photo: STORY.filming,
    steps: ["Tell us what you make and how you like to earn", "Brands that fit arrive in your DMs, sorted by deal type", "Accept, post, and log what you earn as it comes in"],
  },
  {
    id: "brands",
    title: "For businesses",
    photo: STORY.deal,
    steps: ["Tell us what you sell and who you want to reach", "See creators ranked by match, select the best, DM them in one go", "Post opportunities and run affiliate programs that scale"],
  },
] as const;

const FLOW: { title: string; body: string; photo: PhotoT }[] = [
  { title: "Match", body: "Search reads posts, not just bios, and ranks every profile by how well it fits you.", photo: STORY.creatorRed },
  { title: "Message", body: "Brand deals, affiliate offers and PR packages land in their own folders.", photo: STORY.phone },
  { title: "Agree", body: "Accept or decline an offer right in the thread. Budgets are visible up front.", photo: STORY.desk },
  { title: "Earn", body: "Log every payout. Monthly trends, badges and profit, kept honestly self-reported.", photo: STORY.camera },
];

const SHOWCASE = ["Skincare", "Fashion", "Fitness", "Food", "Travel", "Tech", "Home Decor", "Gaming"] as const;

const LEDGER = [
  { title: "Search that reads posts", body: "Looking for skincare? We find people who post about it, even if their bio never says so, ranked by match.", photo: STORY.creatorHood },
  { title: "DMs sorted into folders", body: "Brand deals, affiliate offers and PR packages each land in their own folder, with a budget on every offer.", photo: STORY.phone },
  { title: "A feed with a pulse", body: "Thoughts, photos, video and GIFs. React, repost, quote and get into the comments.", photo: STORY.kitchen },
  { title: "Earnings, spend and profit", body: "Creators see what they earn. Businesses see what they invest, what comes back, and the difference.", photo: STORY.meeting },
];

/* ── Hero pieces ──────────────────────────────────────────────────────── */

const FAN = [
  { x: "-14%", y: "4%", r: "-11deg" },
  { x: "-6%", y: "1%", r: "-4deg" },
  { x: "0%", y: "0%", r: "3deg" },
];

function DealStack({ photos, side, label }: { photos: readonly PhotoT[]; side: "left" | "right"; label: string }) {
  const flip = side === "right" ? -1 : 1;
  return (
    <div data-stack={side} className="deal-stack relative aspect-[3/4] w-[min(33vw,250px)] md:w-[min(22vw,300px)]" role="group" aria-label={label}>
      {photos.map((p, i) => {
        const f = FAN[i]!;
        return (
          <div
            key={p.id}
            className="deal-card absolute inset-0 overflow-hidden rounded-[14px] bg-elevated shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] ring-1 ring-black/5"
            style={{
              ["--x" as string]: flip === 1 ? f.x : f.x.replace("-", ""),
              ["--y" as string]: f.y,
              ["--r" as string]: flip === 1 ? f.r : f.r.startsWith("-") ? f.r.slice(1) : `-${f.r}`,
              ["--i" as string]: side === "left" ? i : i + 0.5,
              zIndex: i,
            }}
          >
            <Photo photo={p} sizes="(min-width: 768px) 300px, 40vw" priority={i === photos.length - 1} decorative={i !== photos.length - 1} />
          </div>
        );
      })}
    </div>
  );
}

/** Illustrative match dial between the two stacks; counts up once. Writes to the DOM directly, so no React render per frame. */
function MatchDial() {
  const num = useRef<HTMLSpanElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const r = 46;
  const c = 2 * Math.PI * r;
  useEffect(() => {
    const paint = (v: number) => {
      if (num.current) num.current.textContent = `${Math.round(v)}%`;
      arc.current?.setAttribute("stroke-dashoffset", String(c * (1 - v / 100)));
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return paint(94);
    const ctl = animate(0, 94, { duration: 1.6, delay: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: paint });
    return () => ctl.stop();
  }, [c]);
  return (
    <div data-dial className="fade-late relative z-20 -mx-6 grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full bg-ink text-canvas shadow-2xl md:-mx-10 md:h-[136px] md:w-[136px]" aria-label="Example: a 94% match between a creator and a business">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="3" className="stroke-canvas/15" />
        <circle ref={arc} cx="50" cy="50" r={r} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-signal" strokeDasharray={c} strokeDashoffset={c} />
      </svg>
      <span className="text-center" aria-hidden="true">
        <span ref={num} className="font-display block text-[34px] leading-none tabular-nums md:text-[46px]">0%</span>
        <span className="mt-1 block text-[10px] font-medium text-canvas/70 md:text-[11px]">example match</span>
      </span>
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Header() {
  const links = [
    ["#how", "How it works"],
    ["#creators", "Creators"],
    ["#brands", "Businesses"],
    ["#faq", "Questions"],
  ] as const;
  return (
    <header className="relative z-30 mx-auto flex max-w-[1440px] items-center gap-6 px-4 py-4 md:px-10 md:py-6">
      <Link href="/" aria-label="Money Machine home"><Logo /></Link>
      <nav aria-label="Sections" className="hidden flex-1 justify-center gap-7 text-[14px] font-medium text-muted lg:flex">
        {links.map(([href, label]) => (
          <a key={href} href={href} className="link-draw pb-0.5 transition-colors hover:text-ink">{label}</a>
        ))}
      </nav>
      <span className="flex-1 lg:hidden" />
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Link href="/onboarding" className="press hidden h-10 items-center rounded-full border border-line px-4 text-sm font-semibold hover:border-ink sm:inline-flex">
          Sign up
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section data-hero className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-[1440px] flex-col px-4 pb-6 md:px-10 md:pb-10">
      <div className="grid gap-6 pt-2 md:grid-cols-[minmax(0,26rem)_1fr] md:items-start md:pt-4">
        <p className="animate-fade-up max-w-[26rem] text-[17px] leading-snug [animation-delay:120ms] md:text-[19px]">
          A social platform where creators and businesses find each other, agree on the work and keep track of the money.
        </p>
        <div className="animate-fade-up flex flex-wrap items-center gap-2 [animation-delay:200ms] md:justify-end">
          <Link href="/onboarding" className="press group inline-flex h-13 items-center gap-2 rounded-full bg-signal pl-6 pr-2 text-[15px] font-semibold text-on-signal hover:brightness-105">
            Get started
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-signal transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <a href="#how" className="press inline-flex h-13 items-center rounded-full px-5 text-[15px] font-semibold hover:bg-elevated">
            See how it works
          </a>
        </div>
      </div>

      {/* The match: creators on one side, businesses on the other */}
      <div data-stage className="relative z-10 mt-8 flex flex-1 items-center justify-center md:mt-4">
        <div data-stack-wrap="left"><DealStack photos={CREATOR_STACK} side="left" label="Creators" /></div>
        <MatchDial />
        <div data-stack-wrap="right"><DealStack photos={BRAND_STACK} side="right" label="Businesses" /></div>
      </div>

      <h1 data-hero-title className="relative z-0 -mt-[6vw] text-[clamp(4.2rem,21vw,7rem)] leading-[0.84] tracking-[-0.02em] md:-mt-[4.5vw] md:text-[clamp(6rem,13.2vw,15rem)]">
        <span className="line-mask"><span className="line-rise" style={{ ["--i" as string]: 0 }}>Create.<span className="md:hidden"> </span></span></span>
        <span className="line-mask md:hidden"><span className="line-rise" style={{ ["--i" as string]: 1 }}>Collab.</span></span>
        <span className="line-mask flex items-end justify-between gap-6">
          <span className="line-rise" style={{ ["--i" as string]: 2 }}>
            <span className="max-md:hidden">Collab. </span>Cash out.
          </span>
        </span>
      </h1>
    </section>
  );
}

function Manifesto() {
  return (
    <section id="how" className="mx-auto max-w-[1440px] scroll-mt-6 px-4 py-24 md:px-10 md:py-40">
      <p data-manifesto className="max-w-[22ch] text-[clamp(1.9rem,4.6vw,4.4rem)] font-medium leading-[1.04] tracking-[-0.025em] md:max-w-[24ch]">
        {MANIFESTO.split(" ").map((w, i) => (
          <span key={i} data-word className="inline-block whitespace-pre">
            {w}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}

function Sides() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-24 px-4 md:space-y-40 md:px-10">
      {SIDES.map((side, k) => (
        <section key={side.id} id={side.id} aria-labelledby={`${side.id}-title`} className="grid scroll-mt-6 items-end gap-8 md:grid-cols-12 md:gap-10">
          <div className={`relative aspect-[4/5] overflow-hidden rounded-[14px] bg-elevated md:col-span-7 md:aspect-[5/4] ${k % 2 ? "md:order-2 md:col-start-6" : ""}`}>
            <div data-parallax className="absolute inset-[-8%_0]">
              <Photo photo={side.photo} sizes="(min-width: 768px) 58vw, 100vw" />
            </div>
          </div>
          <div className={`md:col-span-5 ${k % 2 ? "md:order-1 md:col-start-1" : ""}`}>
            <h2 id={`${side.id}-title`} className="text-[clamp(3rem,7vw,6.5rem)]">{side.title}</h2>
            <ol className="mt-8 border-b border-line">
              {side.steps.map((s, i) => (
                <li key={s} className="grid grid-cols-[2.5rem_1fr] gap-2 border-t border-line py-4 text-[17px] leading-snug">
                  <span className="font-display text-[17px] tabular-nums text-muted" aria-hidden="true">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <Link href="/onboarding" className="press group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-canvas hover:opacity-90">
              {k === 0 ? "Join as a creator" : "Join as a business"}
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}

function Flow() {
  return (
    <section aria-labelledby="flow-title" className="mx-auto max-w-[1440px] px-4 pt-32 md:px-10 md:pt-48">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="flow-title" className="max-w-[12ch] text-[clamp(3rem,7vw,6.5rem)]">How a collab moves</h2>
        <p className="max-w-sm text-[16px] text-muted">The same four steps whichever side you are on. Each one is a screen in the app, not a promise.</p>
      </div>
      <div className="relative mt-12 md:mt-16">
        <div data-flow-rule className="absolute inset-x-0 top-0 h-px origin-left bg-ink" aria-hidden="true" />
        <ol className="grid gap-10 pt-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {FLOW.map((f, i) => (
            <li key={f.title} data-flow-item className="group">
              <p className="flex items-baseline justify-between">
                <span className="font-display text-[34px]">{f.title}</span>
                <span className="text-[13px] tabular-nums text-muted">{i + 1} of 4</span>
              </p>
              <div className="relative mt-4 aspect-[4/5] overflow-hidden rounded-[12px] bg-elevated">
                <Photo photo={f.photo} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw" className="photo-zoom" decorative />
              </div>
              <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-muted">{f.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section aria-labelledby="niche-title" className="mx-auto max-w-[1440px] px-4 pt-32 md:px-10 md:pt-48">
      <h2 id="niche-title" className="max-w-[14ch] text-[clamp(3rem,7vw,6.5rem)]">Sixteen niches. One search.</h2>
      <ul className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-4 md:gap-4">
        {SHOWCASE.map((n, i) => (
          <li key={n} className={i === 0 || i === 5 ? "col-span-2 row-span-2" : ""}>
            <Link href="/onboarding" className="group relative block h-full min-h-[44vw] overflow-hidden rounded-[12px] bg-elevated md:min-h-[17vw]">
              <Photo photo={NICHE_PHOTOS[n]!} sizes={i === 0 || i === 5 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"} className="photo-zoom" decorative />
              <span className="photo-shade absolute inset-0" aria-hidden="true" />
              <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white md:inset-x-4 md:bottom-4">
                <span className={`font-display leading-none ${i === 0 || i === 5 ? "text-[clamp(2.2rem,4.5vw,4rem)]" : "text-[clamp(1.5rem,2.4vw,2.2rem)]"}`}>{n}</span>
                <ArrowUpRight className="h-5 w-5 shrink-0 translate-y-1 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Ledger() {
  const [hover, setHover] = useState<number | null>(null);
  const follow = useRef<HTMLDivElement>(null);
  return (
    <section aria-labelledby="ledger-title" className="mx-auto max-w-[1440px] px-4 pt-32 md:px-10 md:pt-48">
      <h2 id="ledger-title" className="text-[clamp(3rem,7vw,6.5rem)]">What&apos;s inside</h2>
      <ul
        className="mt-12 border-b border-line md:mt-16"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          follow.current?.style.setProperty("--fx", `${e.clientX + 24}px`);
          follow.current?.style.setProperty("--fy", `${e.clientY - 120}px`);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {LEDGER.map((row, i) => (
          <li key={row.title} onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)} className="grid grid-cols-[92px_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-line py-6 transition-colors md:grid-cols-12 md:items-baseline md:gap-6 md:py-9 md:hover:bg-surface/60">
            {/* phones can't hover, so the photo sits in the row */}
            <div className="relative row-span-2 aspect-[4/5] overflow-hidden rounded-[10px] bg-elevated md:hidden" aria-hidden="true">
              <Photo photo={row.photo} sizes="92px" decorative />
            </div>
            <h3 className="font-display self-end text-[clamp(1.9rem,3.6vw,3.4rem)] leading-[0.95] md:col-span-7 md:self-auto">{row.title}</h3>
            <p className="max-w-[44ch] text-[15px] leading-relaxed text-muted md:col-span-5 md:text-[16px]">{row.body}</p>
          </li>
        ))}
      </ul>
      <div ref={follow} className="follow-photo hidden md:block" aria-hidden="true">
        {LEDGER.map((row, i) => (
          <div key={row.title} className="absolute h-[240px] w-[190px] overflow-hidden rounded-[10px] shadow-2xl" style={{ opacity: hover === i ? 1 : 0, transform: hover === i ? "scale(1) rotate(-3deg)" : "scale(0.9) rotate(0deg)" }}>
            <Photo photo={row.photo} sizes="190px" decorative />
          </div>
        ))}
      </div>
    </section>
  );
}

function Questions() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto grid max-w-[1440px] scroll-mt-6 gap-10 px-4 pt-32 md:grid-cols-12 md:px-10 md:pt-48">
      <h2 id="faq-title" className="text-[clamp(3rem,7vw,6.5rem)] md:col-span-4">Questions</h2>
      <div className="border-b border-line md:col-span-8">
        {FAQ.map((f) => (
          <details key={f.q} className="group border-t border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[18px] font-medium md:text-[20px] [&::-webkit-details-marker]:hidden">
              {f.q}
              <Plus className="h-5 w-5 shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-open:rotate-45" aria-hidden="true" />
            </summary>
            <p className="max-w-[60ch] pb-6 text-[16px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section aria-labelledby="close-title" className="mt-32 bg-signal text-on-signal md:mt-48">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-20 md:flex-row md:items-end md:justify-between md:px-10 md:py-28">
        <h2 id="close-title" className="max-w-[11ch] text-[clamp(3.4rem,9vw,8.5rem)]">Your next deal is one match away.</h2>
        <div className="shrink-0">
          <p className="mb-5 max-w-xs text-[16px]">Set up takes about a minute. Free while Money Machine is in preview.</p>
          <Link href="/onboarding" className="press group inline-flex h-14 items-center gap-2 rounded-full bg-on-signal px-7 text-[16px] font-semibold text-signal">
            Get started <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-[1440px] px-4 pb-6 pt-14 md:px-10">
      <div className="flex flex-col gap-4 border-b border-line pb-8 text-[14px] text-muted md:flex-row md:items-center md:justify-between">
        <p>Collaborate. Create. Earn. A preview build by VandLabs Studio.</p>
        <nav aria-label="Footer" className="flex gap-6">
          <Link href="/onboarding" className="link-draw hover:text-ink">Sign up</Link>
          <a href="#faq" className="link-draw hover:text-ink">Questions</a>
          <a href="/llms.txt" className="link-draw hover:text-ink">About this site</a>
        </nav>
      </div>
      <p className="font-display mt-6 select-none whitespace-nowrap text-[17.2vw] leading-[0.8] tracking-[-0.03em] md:text-[15.4vw] xl:text-[min(15.4vw,224px)]" aria-hidden="true">
        Money Machine
      </p>
    </footer>
  );
}

export function Welcome() {
  const { session, ready } = useStore();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  useLandingMotion(root);

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  return (
    <div ref={root} className="relative overflow-x-clip">
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Sides />
        <Flow />
        <Showcase />
        <Ledger />
        <Questions />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
