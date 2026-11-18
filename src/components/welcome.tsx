"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, FolderOpen, MessagesSquare, Rocket, Search, Sparkles, UserRound } from "lucide-react";
import { Waves, WaveDivider } from "./ambient";
import { Logo } from "./logo";
import { Magnetic } from "./motion";
import { ThemeToggle } from "./theme";
import { ButtonLink } from "./ui";
import { WelcomeArt } from "./welcome-art";
import { FAQ } from "@/lib/site";
import { useStore } from "@/lib/store";

const FEATURES = [
  { icon: Search, title: "Search that reads posts", body: "Looking for skincare? We find brands and creators who post about it, even if their bio never says so, ranked by match %." },
  { icon: FolderOpen, title: "DMs sorted into folders", body: "Brand deals, affiliate offers and PR packages each land in their own folder. Our team's folder sends you matches." },
  { icon: MessagesSquare, title: "A feed that feels alive", body: "Share thoughts, photos, videos and GIFs. React, repost, quote and get into the comments." },
  { icon: Rocket, title: "Earnings and growth", body: "Creators track what they earn. Businesses see what they invest, what comes back, and their profit." },
];

const STEPS = {
  creator: ["Tell us what you create and how you want to earn", "Get matched with brands that fit, straight to your DMs", "Accept deals, post, and watch your earnings grow"],
  business: ["Tell us what you sell and which creators you need", "See creators ranked by match %, select all, bulk DM", "Post opportunities and scale what works"],
};

export function Welcome() {
  const { session, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  return (
    <div className="relative overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-4 md:px-8">
        <Logo />
        <span className="flex-1" />
        <ThemeToggle />
        <Link href="/onboarding" className="press hidden h-10 items-center rounded-full border border-line bg-surface/70 px-4 text-sm font-semibold hover:bg-surface sm:inline-flex">
          Sign up
        </Link>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pb-24 lg:pt-10">
          <div className="text-center lg:text-left">
            <p className="animate-fade-up glass inline-flex items-center gap-2 rounded-full border border-line/70 px-3.5 py-1.5 text-[13px] font-semibold">
              <span className="bg-aurora grid h-5 w-5 place-items-center rounded-full text-on-accent"><Sparkles className="h-3 w-3" /></span>
              For creators &amp; the brands that need them
            </p>
            <h1 className="animate-fade-up mt-5 text-[clamp(2.9rem,11vw,6.2rem)] font-extrabold leading-[0.92] tracking-[-0.045em] [animation-delay:80ms]">
              Create.
              <br />
              Collab.
              <br />
              <span className="text-aurora">Cash out.</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-muted [animation-delay:160ms] lg:mx-0">
              Money Machine connects creators and businesses automatically, so brand deals, affiliate programs and UGC find you instead of the other way round.
            </p>
            <div className="animate-fade-up mt-8 flex flex-col items-center gap-3 [animation-delay:240ms] sm:flex-row sm:justify-center lg:justify-start">
              <Magnetic className="w-full sm:w-auto">
                <ButtonLink href="/onboarding" size="lg" className="bg-aurora-flow group h-14 w-full px-8 text-[16px] sm:w-auto">
                  Get started <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </ButtonLink>
              </Magnetic>
              <a href="#how" className="press inline-flex h-14 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-ink hover:bg-surface/70">
                See how it works
              </a>
            </div>
          </div>
          <div className="animate-scale-in [animation-delay:150ms]">
            <WelcomeArt />
          </div>
        </section>

        {/* ── How it works: a dark/ink band with flowing waves ── */}
        <div className="text-surface" aria-hidden="true">
          <WaveDivider />
        </div>
        <section id="how" className="relative scroll-mt-10 overflow-hidden bg-surface">
          <Waves className="absolute left-0 top-6 h-24 w-[200%] opacity-70" lines={4} />
          <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
            <p className="text-center text-[13px] font-bold uppercase tracking-[0.2em] text-brand-700">How it works</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-center text-[clamp(2rem,6vw,3.4rem)] font-extrabold leading-[1.02]">
              Two sides. <span className="text-aurora">One perfect match.</span>
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {([["creator", "For creators", UserRound], ["business", "For businesses", Briefcase]] as const).map(([k, title, Icon]) => (
                <article key={k} className="card lift relative overflow-hidden p-6 md:p-8">
                  <div className="bg-aurora-soft absolute -right-16 -top-16 h-48 w-48 rounded-full" aria-hidden="true" />
                  <span className="bg-aurora relative grid h-12 w-12 place-items-center rounded-2xl text-on-accent"><Icon className="h-6 w-6" /></span>
                  <h3 className="font-display relative mt-4 text-2xl font-extrabold">{title}</h3>
                  <ol className="relative mt-4 space-y-3">
                    {STEPS[k].map((s, i) => (
                      <li key={s} className="flex gap-3 text-[15px]">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-elevated text-[13px] font-bold text-brand-700 ring-1 ring-line">{i + 1}</span>
                        <span className="pt-0.5">{s}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </div>
        </section>
        <div className="text-surface" aria-hidden="true">
          <WaveDivider flip />
        </div>

        {/* ── Features ── */}
        <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <h2 className="max-w-xl text-[clamp(2rem,6vw,3.2rem)] font-extrabold leading-[1.02]">
            Everything you need to <span className="text-aurora">get paid</span> for what you love.
          </h2>
          <ul className="stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <li key={title} style={{ ["--i" as string]: i }} className="card lift p-5">
                <span className="bg-aurora-soft grid h-11 w-11 place-items-center rounded-xl text-brand-700 ring-1 ring-line"><Icon className="h-5 w-5" /></span>
                <h3 className="font-display mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── FAQ ── */}
        <section className="mx-auto max-w-3xl px-5 pb-14 md:px-8" aria-labelledby="faq">
          <h2 id="faq" className="text-center text-3xl font-extrabold">Questions</h2>
          <div className="mt-6 space-y-2.5">
            {FAQ.map((f) => (
              <details key={f.q} className="card group p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-elevated text-lg leading-none transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-4 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="px-5 pb-16 md:px-8">
          <div className="bg-aurora-flow relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-6 py-14 text-center text-on-accent md:py-20">
            <Waves className="absolute bottom-0 left-0 h-28 w-[200%] [--wave-stroke:rgb(0_0_0/0.18)]" lines={4} />
            <h2 className="relative text-[clamp(2.2rem,7vw,4rem)] font-extrabold leading-[0.98]">Your next deal is one match away.</h2>
            <p className="relative mx-auto mt-4 max-w-md text-[16px] font-medium opacity-80">Set up in under a minute. Free during the preview.</p>
            <Link href="/onboarding" className="press relative mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-ink px-8 text-[16px] font-bold text-surface shadow-xl">
              Get started <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-line px-5 py-8 text-sm text-muted md:flex-row md:px-8">
        <Logo />
        <p>Collaborate. Create. Earn. · A preview build by VandLabs Studio</p>
      </footer>
    </div>
  );
}
