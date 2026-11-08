"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { useStore } from "@/lib/store";

const LINKS = [
  { href: "/for-creators", label: "Creators" },
  { href: "/for-brands", label: "Brands" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const { session, ready } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 pt-safe ${scrolled ? "border-b border-line/70 bg-white/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href="/" aria-label="Money Machine home" className="press">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden flex-1 items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-white hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href={ready && session ? "/home" : "/onboarding"}
            className="press group inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {ready && session ? "Open app" : "Get started"}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
