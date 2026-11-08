"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeIndianRupee, Handshake, Link2 } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { ButtonLink } from "@/components/ui";
import { useStore } from "@/lib/store";

function Hero() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-br from-brand-100 via-aqua/30 to-lime/40" />
      <div className="absolute left-4 top-14 grid h-40 w-40 place-items-center rounded-[2.5rem] bg-gradient-to-br from-rose-200 to-orange-100 shadow-xl shadow-rose-900/10">
        <span className="text-4xl font-bold text-rose-500">Cr</span>
      </div>
      <div className="absolute bottom-12 right-4 grid h-40 w-40 place-items-center rounded-[2.5rem] bg-gradient-to-br from-violet-200 to-sky-100 shadow-xl shadow-violet-900/10">
        <span className="text-4xl font-bold text-violet-500">Br</span>
      </div>
      <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-white shadow-lg">
        <Handshake className="h-8 w-8 text-brand-600" />
      </div>
      <span className="absolute right-10 top-10 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow">Collab</span>
      <span className="absolute bottom-6 left-10 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet-600 shadow">Affiliate</span>
    </div>
  );
}

export default function Welcome() {
  const { session, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-brand-50/60">
      <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          <LogoMark className="mx-auto h-14 w-14 lg:mx-0" />
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">Money Machine</h1>
          <p className="mt-3 text-lg text-muted">
            Collaborate. Create. <span className="font-semibold italic text-brand-600">Earn.</span>
          </p>
          <ul className="mx-auto mt-8 hidden max-w-md space-y-3 text-left text-[15px] lg:mx-0 lg:block">
            <li className="flex gap-3"><Handshake className="h-5 w-5 shrink-0 text-brand-600" /> Find brands and creators that match your niche.</li>
            <li className="flex gap-3"><Link2 className="h-5 w-5 shrink-0 text-brand-600" /> Run and join affiliate programs.</li>
            <li className="flex gap-3"><BadgeIndianRupee className="h-5 w-5 shrink-0 text-brand-600" /> Track your income or spending, and earn badges.</li>
          </ul>
          <div className="mt-10 hidden lg:block">
            <ButtonLink href="/onboarding" size="lg" className="px-8">
              Get Started <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
        <div>
          <Hero />
          <div className="mx-auto mt-10 max-w-sm lg:hidden">
            <ButtonLink href="/onboarding" size="lg" className="w-full">
              Get Started <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}
