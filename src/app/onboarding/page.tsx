"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Check, ChevronLeft, FolderOpen, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { Button, DeviceNote, Field, inputCls, selectCls } from "@/components/ui";
import { COUNTRIES, EARNING_MODELS, LOCATIONS, NICHES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { fieldErrors, onboardingInput, type FieldErrors } from "@/lib/validation";
import type { Role } from "@/lib/types";

const ROLES: { id: Role; title: string; body: string; icon: typeof UserRound }[] = [
  { id: "creator", title: "Creator", body: "Create content, land deals and earn.", icon: UserRound },
  { id: "business", title: "Business", body: "Find creators, run campaigns and scale.", icon: Briefcase },
];

function Chips({ options, value, onChange }: { options: readonly { id: string; label: string; hint?: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button key={o.id} type="button" aria-pressed={on} title={o.hint} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])} className={`press inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-colors ${on ? "bg-aurora text-white shadow-sm" : "border border-line bg-surface hover:border-brand-300"}`}>
            {on && <Check className="h-4 w-4" strokeWidth={3} />} {o.label}
          </button>
        );
      })}
    </div>
  );
}

const nicheOpts = NICHES.map((n) => ({ id: n, label: n }));
const earnOpts = EARNING_MODELS.map((m) => ({ id: m.id, label: m.label, hint: m.hint }));

export default function Onboarding() {
  const router = useRouter();
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>("creator");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [earning, setEarning] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [payMin, setPayMin] = useState("");
  const [payMax, setPayMax] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const isBiz = role === "business";
  const STEPS = 4;

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (step === 0) {
      const parsed = onboardingInput.safeParse({ role, displayName, handle });
      if (!parsed.success) return setErrors(fieldErrors(parsed.error));
      setErrors({});
    }
    if (step === 1 && niches.length === 0) return setErrors({ niches: isBiz ? "Pick at least one so creators can find you." : "Pick at least one so brands can find you." });
    if (step === 2 && (isBiz ? lookingFor.length === 0 : earning.length === 0)) return setErrors({ step2: isBiz ? "Pick at least one type of creator." : "Pick at least one way to earn." });
    if (step === 3) {
      const lo = payMin ? Number(payMin) : undefined;
      const hi = payMax ? Number(payMax) : undefined;
      if (lo !== undefined && hi !== undefined && lo > hi) return setErrors({ pay: "The minimum should be smaller than the maximum." });
      const parsed = onboardingInput.parse({ role, displayName, handle });
      update((s) => ({
        ...s,
        session: {
          ...parsed,
          createdAt: new Date().toISOString(),
          niches,
          category: niches[0],
          lookingFor: isBiz ? lookingFor : niches,
          earningModels: earning,
          country: country || undefined,
          city: city || undefined,
          payPerVideoMin: lo,
          payPerVideoMax: hi,
          priceFrom: lo,
          priceTo: hi,
        },
      }));
      router.replace("/home");
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  return (
    <main className="min-h-dvh bg-surface md:grid md:place-items-center md:bg-canvas">
      <form onSubmit={next} className="mx-auto w-full max-w-md px-5 pb-28 pt-6 md:card md:p-8 md:pb-8" noValidate>
        <div className="mb-5 flex items-center gap-3">
          {step === 0 ? (
            <Link href="/" aria-label="Back" className="press -ml-2 grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-canvas"><ChevronLeft className="h-5 w-5" /></Link>
          ) : (
            <button type="button" onClick={() => { setErrors({}); setStep((s) => s - 1); }} aria-label="Back" className="press -ml-2 grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-canvas"><ChevronLeft className="h-5 w-5" /></button>
          )}
          <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of ${STEPS}`}>
            {Array.from({ length: STEPS }, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-aurora" : "bg-line"}`} />)}
          </div>
        </div>

        <div key={step} className="animate-fade-up">
          {step === 0 && (
            <>
              <h1 className="text-[28px] font-extrabold tracking-tight">Who are you?</h1>
              <p className="mt-1 text-sm text-muted">Creators and businesses get different pages, made for what you do.</p>
              <fieldset className="mt-6 grid grid-cols-2 gap-3">
                <legend className="sr-only">Account type</legend>
                {ROLES.map(({ id, title, body, icon: Icon }) => {
                  const selected = role === id;
                  return (
                    <label key={id} className={`press relative flex cursor-pointer flex-col items-center gap-2 rounded-3xl border p-4 text-center transition ${selected ? "border-transparent ring-aurora bg-aurora-soft" : "border-line hover:bg-canvas"}`}>
                      <input type="radio" name="role" value={id} checked={selected} onChange={() => setRole(id)} className="sr-only" />
                      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${selected ? "bg-aurora text-white" : "bg-canvas text-brand-600"}`}><Icon className="h-6 w-6" /></span>
                      <span className="font-bold">{title}</span>
                      <span className="text-[12px] leading-snug text-muted">{body}</span>
                    </label>
                  );
                })}
              </fieldset>
              <div className="mt-6 space-y-4">
                <Field label={isBiz ? "Brand name" : "Your name"} error={errors.displayName}>
                  <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} aria-invalid={!!errors.displayName} autoComplete="name" />
                </Field>
                <Field label="Username" error={errors.handle} hint="This is how people find you.">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">@</span>
                    <input className={`${inputCls} pl-8`} value={handle} onChange={(e) => setHandle(e.target.value)} aria-invalid={!!errors.handle} autoCapitalize="none" autoComplete="username" />
                  </div>
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-[28px] font-extrabold tracking-tight">{isBiz ? "What does your business do?" : "What content do you create?"}</h1>
              <p className="mb-5 mt-1 text-sm text-muted">Pick all that fit. {isBiz ? "Creators searching for these will find you." : "Brands searching for these will find you."}</p>
              <Chips options={nicheOpts} value={niches} onChange={setNiches} />
              {errors.niches && <p role="alert" className="mt-3 text-[13px] text-rose-600">{errors.niches}</p>}
            </>
          )}

          {step === 2 && (
            <>
              {isBiz ? (
                <>
                  <h1 className="text-[28px] font-extrabold tracking-tight">What creators are you looking for?</h1>
                  <p className="mb-5 mt-1 text-sm text-muted">We&apos;ll match you with them automatically and send intros to your Money Machine folder.</p>
                  <Chips options={nicheOpts} value={lookingFor} onChange={setLookingFor} />
                  <h2 className="mb-2 mt-6 font-bold">How do you want to work with them?</h2>
                  <Chips options={earnOpts} value={earning} onChange={setEarning} />
                </>
              ) : (
                <>
                  <h1 className="text-[28px] font-extrabold tracking-tight">How do you want to earn?</h1>
                  <p className="mt-1 text-sm text-muted">Pick all you&apos;re open to.</p>
                  <p className="bg-aurora-soft mb-5 mt-3 flex items-start gap-2 rounded-2xl px-3.5 py-2.5 text-[13px]"><FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> Each one becomes a folder in your Messages, so brand deals, affiliate offers and PR packages never get mixed up.</p>
                  <Chips options={earnOpts} value={earning} onChange={setEarning} />
                </>
              )}
              {errors.step2 && <p role="alert" className="mt-3 text-[13px] text-rose-600">{errors.step2}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-[28px] font-extrabold tracking-tight">Almost there</h1>
              <p className="mb-5 mt-1 text-sm text-muted">Optional, but it makes your matches much better.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Country" optional>
                    <select className={selectCls} value={country} onChange={(e) => { setCountry(e.target.value); setCity(""); }}>
                      <option value="">Choose</option>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="City" optional>
                    <select className={selectCls} value={city} onChange={(e) => setCity(e.target.value)} disabled={!country}>
                      <option value="">{country ? "Choose" : "Country first"}</option>
                      {(LOCATIONS[country] ?? []).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <div>
                  <p className="mb-1.5 text-[13px] font-medium">{isBiz ? "Your budget per video (₹)" : "What you charge per video (₹)"}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <label><span className="sr-only">Minimum</span><input inputMode="numeric" className={inputCls} placeholder="Min" value={payMin} onChange={(e) => setPayMin(e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!errors.pay} /></label>
                    <label><span className="sr-only">Maximum</span><input inputMode="numeric" className={inputCls} placeholder="Max" value={payMax} onChange={(e) => setPayMax(e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!errors.pay} /></label>
                  </div>
                  {errors.pay && <p role="alert" className="mt-1 text-[12px] text-rose-600">{errors.pay}</p>}
                </div>
                <DeviceNote>Preview build: your profile is saved on this device only. Secure accounts arrive with sign-in.</DeviceNote>
              </div>
            </>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-5 py-3 pb-safe backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
          <Button type="submit" size="lg" className="mx-auto w-full max-w-md">
            {step === 3 ? <><Sparkles className="h-5 w-5" /> Show my matches</> : "Continue"}
          </Button>
        </div>
      </form>
    </main>
  );
}
