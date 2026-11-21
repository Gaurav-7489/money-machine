"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Check, ChevronLeft, Sparkles, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { Photo } from "@/components/photo";
import { STORY } from "@/lib/photos";
import Link from "next/link";
import { Button, Field, inputCls, selectCls } from "@/components/ui";
import { EARNING_MODELS, NICHES } from "@/lib/catalog";
import { LocationPicker } from "@/components/location-picker";
import { DEFAULT_CURRENCY, currencySymbol } from "@/lib/format";
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
          <button key={o.id} type="button" aria-pressed={on} title={o.hint} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])} className={`press inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-colors ${on ? "bg-aurora text-on-accent " : "border border-line bg-surface hover:border-brand-300"}`}>
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
  const [region, setRegion] = useState("");
  const [currency, setCurrency] = useState("");
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
          region: region || undefined,
          currency: currency || DEFAULT_CURRENCY,
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

  const panel = [
    { photo: isBiz ? STORY.team : STORY.creatorPortrait, line: isBiz ? "Brands that know who they need." : "Your work, in front of the right brands." },
    { photo: isBiz ? STORY.shop : STORY.camera, line: "Search reads what people post, not only their bio." },
    { photo: STORY.phone, line: "Offers arrive sorted, with the budget up front." },
    { photo: STORY.deal, line: "One minute now. Matches the moment you finish." },
  ][step]!;

  return (
    <main className="min-h-dvh md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-2">
      <aside className="relative hidden h-dvh overflow-hidden bg-primary md:sticky md:top-0 md:block" aria-hidden="true">
        <div key={`${step}-${isBiz}`} className="absolute inset-0 animate-[fade-in_0.7s_ease-out_both]">
          <Photo photo={panel.photo} sizes="50vw" priority={step === 0} decorative />
        </div>
        <span className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/60" />
        <Link href="/" className="pointer-events-auto absolute left-8 top-7 text-white [&_*]:!text-white" tabIndex={-1}><Logo /></Link>
        <div className="absolute inset-x-8 bottom-8 text-white">
          <p className="font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.1]">{panel.line}</p>
          <p className="mt-4 text-[14px] tabular-nums opacity-80">Step {step + 1} of {STEPS}</p>
        </div>
      </aside>
      {/* Phones: the same story as a photo band above the form */}
      <div className="relative h-[34svh] min-h-[220px] overflow-hidden bg-primary text-on-primary md:hidden" aria-hidden="true">
        <div key={`m-${step}-${isBiz}`} className="absolute inset-0 animate-[fade-in_0.7s_ease-out_both]">
          <Photo photo={panel.photo} sizes="100vw" priority={step === 0} decorative />
        </div>
        <span className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/65" />
        <span className="absolute left-5 top-[max(1rem,env(safe-area-inset-top))] [&_*]:!text-white"><Logo /></span>
        <div key={`ml-${step}-${isBiz}`} className="absolute inset-x-5 bottom-9 animate-[fade-up_0.7s_var(--ease-out-expo)_both]">
          <p className="font-display text-[clamp(1.6rem,7vw,2.1rem)] leading-[1.1]">{panel.line}</p>
          <p className="mt-2 text-[13px] tabular-nums opacity-80">Step {step + 1} of {STEPS}</p>
        </div>
      </div>
      <form onSubmit={next} className="relative mx-auto w-full max-w-md bg-canvas px-5 pb-28 pt-5 max-md:-mt-5 max-md:rounded-t-[22px] md:self-center md:bg-transparent md:px-8 md:py-14" noValidate>
        <div className="mb-5 flex items-center gap-3">
          {step === 0 ? (
            <Link href="/" aria-label="Back" className="press -ml-2 grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-elevated"><ChevronLeft className="h-5 w-5" /></Link>
          ) : (
            <button type="button" onClick={() => { setErrors({}); setStep((s) => s - 1); }} aria-label="Back" className="press -ml-2 grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-elevated"><ChevronLeft className="h-5 w-5" /></button>
          )}
          <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of ${STEPS}`}>
            {Array.from({ length: STEPS }, (_, i) => <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-primary" : i === step ? "bg-signal" : "bg-line"}`} />)}
          </div>
        </div>

        <div key={step} className="animate-fade-up">
          {step === 0 && (
            <>
              <h1 className="mb-6 text-[clamp(1.85rem,5vw,2.4rem)] leading-[1.1]">Who are you?</h1>
              <fieldset className="grid grid-cols-2 gap-3">
                <legend className="sr-only">Account type</legend>
                {ROLES.map(({ id, title, body, icon: Icon }) => {
                  const selected = role === id;
                  return (
                    <label key={id} className={`press relative flex cursor-pointer flex-col items-start gap-2 rounded-[14px] border p-4 text-left transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${selected ? "border-brand-500 bg-brand-50" : "border-line hover:border-muted/60"}`}>
                      <input type="radio" name="role" value={id} checked={selected} onChange={() => setRole(id)} className="sr-only" />
                      <span className={`grid h-10 w-10 place-items-center rounded-full transition-colors ${selected ? "bg-signal text-on-signal" : "bg-elevated text-ink"}`}><Icon className="h-5 w-5" /></span>
                      <span className="mt-4 font-semibold">{title}</span>
                      <span className="text-[12px] leading-snug text-muted">{body}</span>
                    </label>
                  );
                })}
              </fieldset>
              <div className="mt-6 space-y-4">
                <Field label={isBiz ? "Brand name" : "Your name"} error={errors.displayName}>
                  <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} aria-invalid={!!errors.displayName} autoComplete="name" />
                </Field>
                <Field label="Username" error={errors.handle}>
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
              <h1 className="mb-6 text-[clamp(1.85rem,5vw,2.4rem)] leading-[1.1]">{isBiz ? "What does your business do?" : "What content do you create?"}</h1>
              <Chips options={nicheOpts} value={niches} onChange={setNiches} />
              {errors.niches && <p role="alert" className="mt-3 text-[13px] text-danger">{errors.niches}</p>}
            </>
          )}

          {step === 2 && (
            <>
              {isBiz ? (
                <>
                  <h1 className="mb-6 text-[clamp(1.85rem,5vw,2.4rem)] leading-[1.1]">What creators are you looking for?</h1>
                  <Chips options={nicheOpts} value={lookingFor} onChange={setLookingFor} />
                  <h2 className="font-text mb-2 mt-8 font-semibold">How do you want to work with them?</h2>
                  <Chips options={earnOpts} value={earning} onChange={setEarning} />
                </>
              ) : (
                <>
                  <h1 className="mb-6 text-[clamp(1.85rem,5vw,2.4rem)] leading-[1.1]">How do you want to earn?</h1>
                  <Chips options={earnOpts} value={earning} onChange={setEarning} />
                </>
              )}
              {errors.step2 && <p role="alert" className="mt-3 text-[13px] text-danger">{errors.step2}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="mb-6 text-[clamp(1.85rem,5vw,2.4rem)] leading-[1.1]">Almost there</h1>
              <div className="space-y-4">
                <LocationPicker
                  value={{ country, region }}
                  onChange={(v) => {
                    setCountry(v.country);
                    setRegion(v.region);
                    setCurrency(v.currency);
                  }}
                />
                <div>
                  <p className="mb-1.5 text-[13px] font-medium">{isBiz ? "Your budget per video" : "What you charge per video"} ({currencySymbol(currency || DEFAULT_CURRENCY)})</p>
                  <div className="grid grid-cols-2 gap-2">
                    <label><span className="sr-only">Minimum</span><input inputMode="numeric" className={inputCls} placeholder="Min" value={payMin} onChange={(e) => setPayMin(e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!errors.pay} /></label>
                    <label><span className="sr-only">Maximum</span><input inputMode="numeric" className={inputCls} placeholder="Max" value={payMax} onChange={(e) => setPayMax(e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!errors.pay} /></label>
                  </div>
                  {errors.pay && <p role="alert" className="mt-1 text-[12px] text-danger">{errors.pay}</p>}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="glass fixed inset-x-0 bottom-0 border-t border-line px-5 py-3 pb-safe md:static md:mt-10 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <Button type="submit" size="lg" className="mx-auto w-full max-w-md">
            {step === 3 ? <><Sparkles className="h-5 w-5" /> Show my matches</> : "Continue"}
          </Button>
        </div>
      </form>
    </main>
  );
}
