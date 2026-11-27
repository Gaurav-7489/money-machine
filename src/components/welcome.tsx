"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Briefcase, Check, ChevronRight, UserRound } from "lucide-react";
import { Logo, LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { Checkout } from "@/components/landing/checkout";
import { CONTENT } from "@/components/landing/content";
import { DealAnimation } from "@/components/landing/deal-animation";
import { LiveMonitor } from "@/components/landing/live-monitor";
import { VideoSlot } from "@/components/landing/video-slot";
import { PLANS, isSide, type Side } from "@/lib/plans";
import { useStore } from "@/lib/store";

const STORAGE_KEY = "mm-side";

const CHOICES: { side: Side; title: string; body: string; icon: typeof UserRound }[] = [
  { side: "creator", title: "I'm a content creator", body: "I make content and want brand deals.", icon: UserRound },
  { side: "business", title: "I'm a business owner", body: "I want creators to promote my brand.", icon: Briefcase },
];

/** First screen: who are you? The page that follows is written for the answer. */
function RoleGate({ onChoose }: { onChoose: (s: Side) => void }) {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-brand-50/60 dark:bg-canvas dark:bg-none">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 py-10 text-center">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="animate-scale-in"><LogoMark className="h-16 w-16" /></div>
        <h1 className="animate-fade-up mt-5 text-4xl font-bold tracking-tight [animation-delay:80ms] md:text-5xl">Money Machine</h1>
        <p className="animate-fade-up mt-3 text-lg text-muted [animation-delay:160ms]">
          Collaborate. Create. <span className="font-semibold italic text-brand-600">Earn.</span>
        </p>
        <h2 className="animate-fade-up mt-12 text-xl font-semibold [animation-delay:260ms]">Which one are you?</h2>
        <div className="stagger mt-5 grid w-full gap-3">
          {CHOICES.map(({ side, title, body, icon: Icon }, i) => (
            <button
              key={side}
              onClick={() => onChoose(side)}
              style={{ ["--i" as string]: i + 4 }}
              className="press group flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-elevated dark:text-brand-300">
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-bold">{title}</span>
                <span className="block text-sm text-muted">{body}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

function Heading({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 id={id} className="text-2xl font-bold tracking-tight">{children}</h2>;
}

/** The front page for one side, in order: title, what it is, animation, video, checklist, live numbers, checkout. */
function Front({ side, onSwitch }: { side: Side; onSwitch: () => void }) {
  const c = CONTENT[side];
  const plan = PLANS[side];
  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-brand-50/60 pb-16 dark:bg-canvas dark:bg-none">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/85 pt-safe backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2.5">
          <span className="sm:hidden"><Logo withText={false} /></span>
          <span className="hidden whitespace-nowrap sm:inline"><Logo /></span>
          <div className="flex-1" />
          <button onClick={onSwitch} className="press inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3 text-[13px] font-semibold" aria-label={`You're viewing the ${c.label} page. Switch.`}>
            {c.label} <ArrowLeftRight className="h-3.5 w-3.5 text-muted" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-14 px-4 pt-10">
        {/* 1. Title */}
        <section className="text-center">
          <div className="animate-scale-in"><LogoMark className="mx-auto h-14 w-14" /></div>
          <h1 className="animate-fade-up mt-4 text-5xl font-bold tracking-tight [animation-delay:80ms] md:text-6xl">Money Machine</h1>
          <p className="animate-fade-up mx-auto mt-4 max-w-md text-lg text-muted [animation-delay:160ms]">{c.pitch}</p>
          <a href="#join" className="press animate-fade-up mt-6 inline-flex h-12 items-center rounded-full bg-brand-600 px-7 text-[15px] font-semibold text-white shadow-sm hover:bg-brand-700 [animation-delay:240ms] dark:bg-primary dark:text-on-primary">
            Start for ${plan.firstMonth}
          </a>
        </section>

        {/* 2. What is Money Machine */}
        <section aria-labelledby="what">
          <Heading id="what">What is Money Machine?</Heading>
          <p className="mt-3 text-[17px] leading-relaxed">
            Money Machine is a social platform where content creators and business owners find each other, make deals and get paid, all in one place.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{c.whatIs}</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {c.steps.map(([title, body], i) => (
              <li key={title} className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-[13px] font-bold text-white dark:bg-primary dark:text-on-primary">{i + 1}</span>
                <p className="mt-3 text-[15px] font-semibold">{title}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. Animation */}
        <DealAnimation />

        {/* 4. Video */}
        <section aria-labelledby="watch">
          <Heading id="watch">See how it works</Heading>
          <div className="mt-4"><VideoSlot src={c.video} label={`How Money Machine works for ${c.label.toLowerCase()}s`} /></div>
        </section>

        {/* 5. Checklist */}
        <section aria-labelledby="get">
          <Heading id="get">Everything you get</Heading>
          <ul className="mt-4 space-y-3">
            {c.checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px]">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-600 text-white dark:bg-primary dark:text-on-primary"><Check className="h-3 w-3" strokeWidth={3.5} /></span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 6. Live monitor */}
        <LiveMonitor />

        {/* 8. Checkout */}
        <Checkout side={side} />
      </div>
    </main>
  );
}

export function Welcome() {
  const { session, ready } = useStore();
  const router = useRouter();
  const [side, setSide] = useState<Side | null>(null);

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  // Remember the choice (or take it from ?as=creator / ?as=business).
  useEffect(() => {
    const asParam = new URLSearchParams(window.location.search).get("as");
    if (isSide(asParam)) return setSide(asParam);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isSide(saved)) setSide(saved);
    } catch {}
  }, []);

  function choose(s: Side | null) {
    setSide(s);
    try {
      if (s) localStorage.setItem(STORAGE_KEY, s);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
    window.scrollTo({ top: 0 });
  }

  return side ? <Front side={side} onSwitch={() => choose(null)} /> : <RoleGate onChoose={choose} />;
}
