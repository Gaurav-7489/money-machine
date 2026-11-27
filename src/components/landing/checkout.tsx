"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui";
import { PLANS, type Side } from "@/lib/plans";

/** Price card, with Stripe's checkout (cards, Apple Pay, Google Pay and more) opening right here on the page. */
export function Checkout({ side }: { side: Side }) {
  const plan = PLANS[side];
  const [state, setState] = useState<{ status: "idle" | "loading" } | { status: "ready"; secret: string; stripe: Promise<Stripe | null> } | { status: "error"; message: string }>({ status: "idle" });

  async function start() {
    setState({ status: "loading" });
    try {
      const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ side }) });
      const data = (await res.json().catch(() => ({}))) as { clientSecret?: string; error?: string };
      if (!res.ok || !data.clientSecret || !key) {
        setState({ status: "error", message: res.status === 503 || !key ? "Payments aren't switched on yet. Please check back very soon." : data.error ?? "We couldn't start checkout. Please try again." });
        return;
      }
      setState({ status: "ready", secret: data.clientSecret, stripe: loadStripe(key) });
    } catch {
      setState({ status: "error", message: "We couldn't reach checkout. Check your connection and try again." });
    }
  }

  return (
    <section id="join" aria-label="Join Money Machine" className="scroll-mt-20 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-lift)]">
      <div className="bg-gradient-to-br from-brand-600 to-brand-500 px-6 py-7 text-center text-white dark:from-brand-800 dark:to-brand-700">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-white/80">{plan.label}</p>
        <p className="mt-2 flex items-baseline justify-center gap-2">
          <span className="text-6xl font-bold tracking-tight">${plan.firstMonth}</span>
          <span className="text-lg font-medium text-white/90">first month</span>
        </p>
        <p className="mt-2 text-lg font-semibold">then ${plan.monthly}/month</p>
        <p className="mt-1 text-[14px] text-white/85">Cancel anytime.</p>
      </div>

      <div className="p-5">
        {state.status === "ready" ? (
          <EmbeddedCheckoutProvider stripe={state.stripe} options={{ clientSecret: state.secret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        ) : (
          <>
            <Button size="lg" className="w-full" onClick={start} disabled={state.status === "loading"}>
              {state.status === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening checkout…</> : <>Start for ${plan.firstMonth}</>}
            </Button>
            {state.status === "error" && <p role="alert" className="mt-3 text-center text-[13px] text-danger">{state.message}</p>}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-muted">
              <Lock className="h-3.5 w-3.5 shrink-0" /> Secure payment by Stripe. Apple Pay, Google Pay or card.
            </p>
          </>
        )}
        <p className="mt-3 text-center text-[12px] text-muted">
          ${plan.firstMonth} today, then ${plan.monthly} every month until you cancel. You can cancel at any time.
        </p>
      </div>
    </section>
  );
}
