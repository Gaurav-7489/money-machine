"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Briefcase, FolderOpen, Plus, Search, UserRound, Wallet, Workflow } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme";
import { ButtonLink } from "./ui";
import { TabIndicator } from "./motion";
import { WelcomeArt } from "./welcome-art";
import { FAQ } from "@/lib/site";
import { useStore } from "@/lib/store";

const ROLES = {
  creator: {
    label: "For creators",
    title: "Make a living from what you make.",
    steps: [
      ["Set up your profile", "Tell us what you create and how you want to earn."],
      ["Find brands that fit", "Discover relevant opportunities and receive matches in your DMs."],
      ["Track the work that pays", "Manage deals and log earnings from campaigns, affiliate sales and UGC."],
    ],
  },
  business: {
    label: "For businesses",
    title: "Find people who fit your brand.",
    steps: [
      ["Set up your business", "Tell us what you sell and which creators you need."],
      ["Compare and reach out", "See creators ranked by match %, then message one or reach out in bulk."],
      ["Track what works", "Post opportunities, run affiliate programs and record campaign spending and returns."],
    ],
  },
} as const;
type Role = keyof typeof ROLES;

const PREVIEW_FOLDERS = {
  "Brand deals": ["Studio North", "UGC brief · Product launch"],
  Affiliates: ["Field Supply", "Affiliate invitation · Outdoor gear"],
  PR: ["Daylight Goods", "PR package · Press samples"],
} as const;
type Folder = keyof typeof PREVIEW_FOLDERS;

function FeaturePreviews() {
  const [folder, setFolder] = useState<Folder>("Brand deals");
  const [sender, subject] = PREVIEW_FOLDERS[folder];

  return (
    <div className="landing-bento">
      <article className="landing-feature landing-feature-search" data-reveal>
        <Search aria-hidden="true" />
        <h3>Search that reads posts</h3>
        <p>Find creators and brands by what they post about, with a match score to help you shortlist.</p>
        <div className="landing-preview" aria-label="Sample search results">
          <div className="landing-search-preview"><Search size={16} aria-hidden="true" /> Skincare UGC</div>
          <div className="landing-preview-row">
            <span className="landing-initials" aria-hidden="true">MC</span>
            <div><strong>Maya Chen</strong><small>Skincare · UGC creator</small></div>
            <span className="landing-status">94% match</span>
          </div>
        </div>
      </article>
      <article className="landing-feature" data-reveal>
        <FolderOpen aria-hidden="true" />
        <h3>DMs sorted into folders</h3>
        <p>Keep brand deals, affiliate offers and PR packages in their own folders.</p>
        <div className="landing-preview">
          <div className="landing-folders" role="group" aria-label="Sample inbox folders">
            {(Object.keys(PREVIEW_FOLDERS) as Folder[]).map((name) => (
              <button type="button" className="press" key={name} aria-pressed={folder === name} onClick={() => setFolder(name)}>{name}</button>
            ))}
          </div>
          <div className="landing-preview-row" aria-live="polite">
            <span className="landing-initials" aria-hidden="true">{sender.split(" ").map((word) => word[0]).join("")}</span>
            <div><strong>{sender}</strong><small>{subject}</small></div>
          </div>
        </div>
      </article>
      <article className="landing-feature landing-feature-small" data-reveal>
        <Wallet aria-hidden="true" />
        <h3>Earnings and growth</h3>
        <p>Creators log earnings. Businesses track spend, revenue and profit. Badges mark milestones along the way.</p>
      </article>
      <article className="landing-feature landing-feature-small" data-reveal>
        <Workflow aria-hidden="true" />
        <h3>A feed that feels alive</h3>
        <p>Share photos, videos, GIFs and updates. Turn a good post into your next conversation.</p>
      </article>
    </div>
  );
}

export function Welcome() {
  const { session, ready } = useStore();
  const router = useRouter();
  const [role, setRole] = useState<Role>("creator");
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    landingRef.current?.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={landingRef} className="landing">
      <a href="#landing-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-20">Skip to content</a>
      <header className="landing-header landing-wrap">
        <Logo />
        <nav aria-label="On this page" className="landing-header-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="landing-header-actions">
          <ThemeToggle />
          <ButtonLink href="/onboarding" variant="secondary" size="sm">Sign up</ButtonLink>
        </div>
      </header>

      <main id="landing-main" tabIndex={-1}>
        <section className="landing-wrap landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-kicker">For creators and businesses</p>
            <h1 id="landing-title">Create. Collab.<br /> Cash out.</h1>
            <p className="landing-intro">Find the right people for brand deals, affiliate programs and UGC. Manage the work and see what it earns.</p>
            <div className="landing-actions">
              <ButtonLink href="/onboarding" size="lg">Get started</ButtonLink>
              <a href="#how" className="landing-text-link">See how it works <ArrowDown size={15} aria-hidden="true" /></a>
            </div>
          </div>
          <WelcomeArt />
        </section>

        <section id="how" className="landing-section landing-how" aria-labelledby="how-title">
          <div className="landing-wrap landing-how-grid">
            <div data-reveal>
              <p className="landing-kicker">How it works</p>
              <h2 id="how-title">{ROLES[role].title}</h2>
              <div className="landing-role-toggle" role="group" aria-label="Choose how you use Money Machine">
                {(Object.keys(ROLES) as Role[]).map((option) => {
                  const Icon = option === "creator" ? UserRound : Briefcase;
                  return (
                    <button key={option} type="button" aria-pressed={role === option} aria-controls="role-steps" onClick={() => setRole(option)}>
                      {role === option && <TabIndicator group="landing-role" variant="pill" className="landing-role-indicator" />}
                      <Icon size={16} aria-hidden="true" />
                      {ROLES[option].label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div id="role-steps" aria-live="polite">
              <ol key={role} className="landing-steps animate-fade-in">
                {ROLES[role].steps.map(([title, description], index) => (
                  <li key={title}>
                    <span className="landing-step-number" aria-hidden="true">{index + 1}</span>
                    <div><h3>{title}</h3><p>{description}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="features" className="landing-wrap landing-section" aria-labelledby="feature-title">
          <div className="landing-section-heading" data-reveal>
            <h2 id="feature-title">From first message to paid work.</h2>
            <p>Sample previews from the workspace.</p>
          </div>
          <FeaturePreviews />
        </section>

        <section className="landing-wrap landing-section landing-faq" aria-labelledby="faq">
          <h2 id="faq" data-reveal>Questions</h2>
          <div className="landing-faq-list">
            {FAQ.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}<Plus size={18} aria-hidden="true" /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="landing-wrap" aria-labelledby="closing-title">
          <div className="landing-cta" data-reveal>
            <div>
              <h2 id="closing-title">Ready to find your next deal?</h2>
              <p>Free during the preview.</p>
            </div>
            <ButtonLink href="/onboarding" size="lg">Get started</ButtonLink>
          </div>
        </section>
      </main>

      <footer className="landing-wrap landing-footer">
        <Logo />
        <p>A preview build by VandLabs Studio</p>
      </footer>
    </div>
  );
}
