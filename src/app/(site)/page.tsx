import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeIndianRupee, Briefcase, Link2, MessageCircle, Plus, Smartphone, Star, UserRound } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { PhoneMockup } from "@/components/site/phone-mockup";
import { FAQ, SITE } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const STEPS = [
  { n: "01", title: "Create your profile", body: "Pick creator or business, add your niche and what you make or sell." },
  { n: "02", title: "Connect and collaborate", body: "Discover each other, message directly and join or launch affiliate programs." },
  { n: "03", title: "Earn and track", body: "Log income or spending, watch your monthly growth and collect badges." },
];

const FEATURES = [
  { icon: Link2, title: "Affiliate programs", body: "Brands set commission and terms. Creators apply. Commissions are recorded only when a sale is confirmed — never estimated.", tone: "bg-violet-50 text-violet-600" },
  { icon: BadgeIndianRupee, title: "Income & spending", body: "A private ledger for every collab. Self-reported and verified records are always kept apart.", tone: "bg-emerald-50 text-emerald-600" },
  { icon: Star, title: "Achievement badges", body: "Milestones like Collab Pro and Program Launcher, awarded automatically from real activity.", tone: "bg-amber-50 text-amber-500" },
  { icon: MessageCircle, title: "Direct messaging", body: "Talk to brands and creators in one inbox — no hunting through DMs across apps.", tone: "bg-sky-50 text-sky-600" },
];

function jsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/icons/icon-512.png`,
      slogan: SITE.tagline,
      founder: { "@type": "Person", name: SITE.founder },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE.name,
      url: SITE.url,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Creator marketing & social",
      operatingSystem: "Any (web, iOS, Android via PWA)",
      browserRequirements: "Requires a modern browser with JavaScript",
      description: SITE.description,
      featureList: FEATURES.map((f) => f.title).concat("Social feed", "Add to Home Screen (PWA)"),
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
}

export default function Landing() {
  return (
    <>
      <JsonLd data={jsonLd()} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(45,227,200,0.16),transparent_70%),radial-gradient(40%_40%_at_10%_80%,rgba(166,232,142,0.18),transparent_70%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
          <div className="text-center lg:text-left">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" /> {SITE.tagline}
            </p>
            <h1 className="animate-fade-up mt-5 text-[2.6rem] font-bold leading-[1.05] tracking-[-0.035em] [animation-delay:80ms] sm:text-6xl lg:text-[4.1rem]">
              Where creators and brands <span className="text-gradient">make money together</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted [animation-delay:160ms] lg:mx-0">
              Money Machine is the social platform for brand deals, affiliate programs and UGC — with your earnings, programs and badges in one clean place.
            </p>
            <div className="animate-fade-up mt-8 flex flex-col items-center gap-3 [animation-delay:240ms] sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/onboarding" className="press group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 sm:w-auto">
                Get started free <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="/for-brands" className="press inline-flex h-12 w-full items-center justify-center rounded-full border border-line bg-white px-7 text-[15px] font-semibold hover:border-brand-200 sm:w-auto">
                I&apos;m a brand
              </Link>
            </div>
            <p className="animate-fade-up mt-6 flex items-center justify-center gap-2 text-xs text-muted [animation-delay:320ms] lg:justify-start">
              <Smartphone className="h-3.5 w-3.5" /> Works on iPhone, Android and desktop — add it to your home screen.
            </p>
          </div>
          <div className="animate-scale-in [animation-delay:200ms]">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="bg-canvas py-20 md:py-28" aria-labelledby="audiences">
        <div className="mx-auto max-w-6xl px-5">
          <h2 id="audiences" data-reveal className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight md:text-[2.6rem] md:leading-tight">
            One platform, <span className="text-gradient">two sides</span> of every collab
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              { href: "/for-creators", icon: UserRound, tone: "from-rose-100 via-white to-orange-50", iconTone: "bg-rose-50 text-rose-500", title: "For creators", body: "Get discovered, join affiliate programs and see exactly what you earn every month.", cta: "Explore creator tools" },
              { href: "/for-brands", icon: Briefcase, tone: "from-violet-100 via-white to-sky-50", iconTone: "bg-violet-50 text-violet-600", title: "For brands", body: "Find creators by niche, launch affiliate programs and keep creator spend organised.", cta: "Explore brand tools" },
            ].map((c, i) => (
              <Link key={c.href} href={c.href} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }} className={`lift group card block bg-gradient-to-br p-7 md:p-9 ${c.tone}`}>
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c.iconTone}`}>
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-2xl font-bold tracking-tight">{c.title}</h3>
                <p className="mt-2 max-w-sm leading-relaxed text-muted">{c.body}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  {c.cta} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-20 md:py-28" aria-labelledby="how">
        <div className="mx-auto max-w-6xl px-5">
          <p data-reveal className="text-center text-sm font-semibold text-brand-600">How it works</p>
          <h2 id="how" data-reveal className="mt-2 text-center text-3xl font-bold tracking-tight md:text-[2.6rem]">From profile to payout in three steps</h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.n} data-reveal style={{ ["--d" as string]: `${i * 120}ms` }} className="relative">
                <span className="text-5xl font-bold tracking-tight text-brand-100">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="bg-canvas py-20 md:py-28" aria-labelledby="features">
        <div className="mx-auto max-w-6xl px-5">
          <h2 id="features" data-reveal className="max-w-xl text-3xl font-bold tracking-tight md:text-[2.6rem] md:leading-tight">
            Everything a collab needs. <span className="text-muted">Nothing it doesn&apos;t.</span>
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <article key={f.title} data-reveal style={{ ["--d" as string]: `${(i % 2) * 100}ms` }} className="card lift p-7">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${f.tone}`}>
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{f.body}</p>
              </article>
            ))}
          </div>
          <div data-reveal className="mt-4 flex flex-col items-start gap-4 overflow-hidden rounded-[var(--radius-card)] bg-ink p-7 text-white sm:flex-row sm:items-center md:p-9">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10">
              <Smartphone className="h-6 w-6 text-aqua" />
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Add to Home Screen</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/70">Install Money Machine like an app — full screen, one tap away. No app store needed.</p>
            </div>
            <Link href="/onboarding" className="press inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-ink hover:bg-brand-50">
              Try it now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 py-20 md:py-28" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div data-reveal>
            <p className="text-sm font-semibold text-brand-600">FAQ</p>
            <h2 id="faq-title" className="mt-2 text-3xl font-bold tracking-tight md:text-[2.6rem] md:leading-tight">Questions, answered</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-muted">Everything you need to know about how Money Machine works for creators and brands.</p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f, i) => (
              <details key={f.q} data-reveal style={{ ["--d" as string]: `${i * 50}ms` }} className="faq group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[15px] md:text-base">{f.q}</h3>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-canvas transition-transform duration-300 group-open:rotate-45">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="pb-5 pr-10 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 md:pb-28">
        <div data-reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-16 text-center text-white md:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-aqua/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-lime/25 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight md:text-5xl">Your next collab starts here</h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/80">Set up your profile in under a minute.</p>
          <Link href="/onboarding" className="press group relative mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 font-semibold text-brand-700 shadow-xl hover:bg-cream">
            Get started <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
}
