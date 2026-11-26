"use client";

import { useState } from "react";
import { CreditCard, Eye, ShieldCheck, Unplug } from "lucide-react";
import { Button, Field, inputCls, selectCls } from "./ui";
import type { Session } from "@/lib/types";

export const GATEWAYS = ["Razorpay", "Stripe", "PayPal", "Cashfree", "PayU", "Paytm", "Square", "Other"] as const;

/**
 * Creators: links to their social media API / insights, so Money Machine can
 * read their monthly views and show them on their profile.
 */
export function SocialApiFields({ value, onChange, errors = {} }: { value: { instagram: string; youtube: string }; onChange: (v: { instagram: string; youtube: string }) => void; errors?: { instagram?: string; youtube?: string } }) {
  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 text-[13px] text-muted">
        <Eye className="mt-0.5 h-4 w-4 shrink-0" />
        Paste the API link from your social media. We use it to count your monthly views and show them on your profile, so brands can see your reach.
      </p>
      <Field label="Instagram API link" optional error={errors.instagram}>
        <input type="url" inputMode="url" autoCapitalize="none" className={inputCls} placeholder="https://graph.instagram.com/…" value={value.instagram} onChange={(e) => onChange({ ...value, instagram: e.target.value })} aria-invalid={!!errors.instagram} />
      </Field>
      <Field label="YouTube API link" optional error={errors.youtube}>
        <input type="url" inputMode="url" autoCapitalize="none" className={inputCls} placeholder="https://www.googleapis.com/youtube/…" value={value.youtube} onChange={(e) => onChange({ ...value, youtube: e.target.value })} aria-invalid={!!errors.youtube} />
      </Field>
    </div>
  );
}

/**
 * Businesses: connect a payment gateway so sales can be tracked and badges
 * verified. Only the provider and the key's last 4 characters are kept;
 * the full key is never saved in this preview.
 */
export function PaymentGatewayConnect({ value, onChange }: { value: Session["paymentGateway"]; onChange: (v: Session["paymentGateway"]) => void }) {
  const [provider, setProvider] = useState<string>(GATEWAYS[0]);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line p-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><ShieldCheck className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1 text-[14px]">
          <span className="block font-semibold">{value.provider} connected</span>
          <span className="block text-[12px] text-muted">Key ending in {value.keyHint}</span>
        </span>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange(undefined)}><Unplug className="h-4 w-4" /> Disconnect</Button>
      </div>
    );
  }

  function connect() {
    const k = key.trim();
    if (k.length < 8) return setError("Paste your full API key (at least 8 characters).");
    setError("");
    onChange({ provider, keyHint: k.slice(-4), connectedAt: new Date().toISOString() });
    setKey("");
  }

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 text-[13px] text-muted">
        <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
        Connect the payment gateway you sell with. We use it to track your sales and growth, and to give you badges you really earned.
      </p>
      <div className="grid gap-2 sm:grid-cols-[10rem_1fr]">
        <Field label="Gateway">
          <select className={selectCls} value={provider} onChange={(e) => setProvider(e.target.value)}>
            {GATEWAYS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="API key" error={error}>
          <input type="password" autoComplete="off" autoCapitalize="none" spellCheck={false} className={inputCls} placeholder="Paste your API key" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); connect(); } }} aria-invalid={!!error} />
        </Field>
      </div>
      <Button type="button" variant="soft" onClick={connect} disabled={!key.trim()}><ShieldCheck className="h-4 w-4" /> Connect</Button>
      <p className="text-[12px] text-muted">We never show or keep your full key, only the last 4 characters.</p>
    </div>
  );
}
