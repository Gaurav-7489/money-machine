"use client";

import { useState } from "react";
import { Check, CreditCard, ShieldCheck, Unplug } from "lucide-react";
import { Button, Field, inputCls, selectCls } from "./ui";
import type { Session } from "@/lib/types";

export const GATEWAYS = ["Razorpay", "Stripe", "PayPal", "Cashfree", "PayU", "Paytm", "Square", "Other"] as const;

function InstagramLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fdb132" />
          <stop offset="45%" stopColor="#e1306c" />
          <stop offset="100%" stopColor="#833ab4" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="url(#ig-grad)" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="url(#ig-grad)" strokeWidth="2.2" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="#e1306c" />
    </svg>
  );
}

function YouTubeLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1.5" y="5" width="21" height="14" rx="4" fill="#ff0000" />
      <path d="M10 9l5.2 3L10 15z" fill="#ffffff" />
    </svg>
  );
}

/** A link field with a brand logo that springs in once the link is valid-looking. */
function ApiField({ label, logo, value, onChange, placeholder, error }: { label: string; logo: React.ReactNode; value: string; onChange: (v: string) => void; placeholder: string; error?: string }) {
  const filled = value.trim().length > 8;
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-[13px] font-medium">
        {label} <span className="font-normal text-muted">(optional)</span>
      </span>
      <span className={`group flex items-center gap-3 rounded-xl border bg-surface px-3.5 py-2.5 transition-all duration-300 [transition-timing-function:var(--ease-spring)] focus-within:-translate-y-0.5 focus-within:border-brand-400 focus-within:shadow-[0_8px_20px_-10px_rgb(14_122_92/0.45)] focus-within:ring-4 focus-within:ring-brand-100 ${error ? "border-danger" : "border-line"}`}>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canvas transition-transform duration-300 [transition-timing-function:var(--ease-spring)] ${filled ? "scale-110 rotate-[-6deg]" : ""}`}>
          {logo}
        </span>
        <input
          type="url"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted/70"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
        />
        {filled && !error && <span className="animate-pop grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>}
      </span>
      {error && <span role="alert" className="animate-fade-up mt-1 block text-[12px] text-danger">{error}</span>}
    </label>
  );
}

/** Creators: API links from Instagram and YouTube, used to read monthly views. */
export function SocialApiFields({ value, onChange, errors = {} }: { value: { instagram: string; youtube: string }; onChange: (v: { instagram: string; youtube: string }) => void; errors?: { instagram?: string; youtube?: string } }) {
  return (
    <div className="space-y-4">
      <ApiField label="Instagram API link" logo={<InstagramLogo />} placeholder="https://graph.instagram.com/…" value={value.instagram} onChange={(v) => onChange({ ...value, instagram: v })} error={errors.instagram} />
      <ApiField label="YouTube API link" logo={<YouTubeLogo />} placeholder="https://www.googleapis.com/youtube/…" value={value.youtube} onChange={(v) => onChange({ ...value, youtube: v })} error={errors.youtube} />
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
