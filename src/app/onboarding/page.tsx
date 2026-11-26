"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeIndianRupee, Briefcase, Check, ChevronLeft, MapPin, Search, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { Button, Field, inputCls, selectCls } from "@/components/ui";
import { EARNING_MODELS, NICHES } from "@/lib/catalog";
import { DEFAULT_CURRENCY } from "@/lib/format";
import { EMPTY_PRICES, PriceFields, type PriceValues } from "@/components/price-fields";
import { PaymentGatewayConnect, SocialApiFields } from "@/components/connect-accounts";
import { priceKindsFor, type PriceKind } from "@/lib/pricing";
import { useGeo } from "@/lib/geo";
import Image from "next/image";
import { NICHE_PHOTOS, STORY, nichePhoto, photoSrc, type Photo } from "@/lib/photos";
import { useStore } from "@/lib/store";
import { apiLink, fieldErrors, onboardingInput, type FieldErrors } from "@/lib/validation";
import type { Role, Session } from "@/lib/types";

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
          <button key={o.id} type="button" aria-pressed={on} title={o.hint} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])} className={`group inline-flex h-10 origin-center items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-all duration-300 [transition-timing-function:var(--ease-spring)] active:scale-90 ${on ? "-translate-y-0.5 scale-105 border border-brand-400 bg-brand-50 text-brand-700 shadow-[0_6px_16px_-6px_rgb(14_122_92/0.45)] ring-4 ring-brand-100" : "border border-line bg-surface hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"}`}>
            <span className={`grid h-4 overflow-hidden transition-[width,opacity] duration-300 ${on ? "w-4 opacity-100" : "w-0 opacity-0"}`} aria-hidden="true">
              {on && <Check className="animate-pop h-4 w-4" strokeWidth={3} />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const nicheOpts = NICHES.map((n) => ({ id: n, label: n }));
const earnOpts = EARNING_MODELS.map((m) => ({ id: m.id, label: m.label, hint: m.hint }));

/** Photo tiles of one size. The grid reflows with the screen; the chosen tile zooms and ticks. */
function PhotoPicker<T extends string>({ items, value, onChange, cols, wide }: { items: { id: T; label: string; photo: Photo }[]; value: string[]; onChange: (v: T[]) => void; cols: "grid-cols-2" | "grid-cols-3"; wide: string }) {
  return (
    <ul className={`grid ${cols} grid-rows-[repeat(6,minmax(0,1fr))] h-[calc(100dvh-19rem)] min-h-[26rem] gap-2 sm:h-auto sm:min-h-0 sm:grid-rows-none sm:gap-3 ${wide}`}>
      {items.map(({ id, label, photo }) => {
        const on = value.includes(id);
        return (
          <li key={id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? (value.filter((x) => x !== id) as T[]) : ([...value, id] as T[]))}
              className={`press group relative block h-full min-h-0 w-full origin-center overflow-hidden rounded-2xl bg-elevated text-left sm:aspect-[4/3] sm:h-auto md:rounded-3xl transition-all duration-300 [transition-timing-function:var(--ease-spring)] active:scale-95 ${on ? "scale-[1.03] ring-2 ring-signal ring-offset-2 ring-offset-surface" : "hover:-translate-y-0.5"}`}
            >
              <Image src={photoSrc(photo, 640)} alt="" fill sizes="(min-width: 640px) 200px, 50vw" className={`object-cover transition duration-500 ${on ? "scale-110" : "grayscale-[25%] group-hover:scale-105"}`} />
              <span className={`absolute inset-0 transition-colors duration-300 ${on ? "bg-black/20" : "bg-black/45 group-hover:bg-black/30"}`} aria-hidden="true" />
              <span className="absolute inset-x-2.5 bottom-2.5 text-[15px] font-semibold leading-tight text-white sm:text-[14px] lg:text-[15px]">{label}</span>
              <span className={`absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-signal text-on-signal sm:h-6 sm:w-6 transition-all duration-300 [transition-timing-function:var(--ease-spring)] ${on ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} aria-hidden="true">
                {on && <Check className="animate-pop h-3.5 w-3.5" strokeWidth={3} />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Niches: each one's own photo. */
function NichePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return <PhotoPicker items={NICHES.map((n) => ({ id: n, label: n, photo: nichePhoto(n) }))} value={value} onChange={onChange} cols="grid-cols-3" wide="sm:grid-cols-4 lg:grid-cols-6" />;
}

/** How you work: a photo for each way of earning. */
const EARN_PHOTO: Record<string, Photo> = {
  brand_deal: STORY.deal,
  affiliate: STORY.shop,
  ugc: STORY.camera,
  pr_package: STORY.rack,
  sponsored: STORY.filming,
  review: NICHE_PHOTOS.Tech!,
  shoutout: STORY.creatorRed,
  ambassador: STORY.creatorPortrait,
  partnership: STORY.team,
  seeding: NICHE_PHOTOS.Skincare!,
  event: STORY.studio,
};

function EarnPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return <PhotoPicker items={EARNING_MODELS.map((m) => ({ id: m.id, label: m.label, photo: EARN_PHOTO[m.id] ?? STORY.deal }))} value={value} onChange={onChange} cols="grid-cols-2" wide="sm:grid-cols-3 lg:grid-cols-4" />;
}

/** Country and state as horizontal sliders, with a search box for countries. */
function LocationSlider({ value, onChange }: { value: { country: string; region: string }; onChange: (v: { country: string; region: string; currency: string }) => void }) {
  const geo = useGeo();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const countries = (geo?.countries ?? []).filter((c) => !needle || c.name.toLowerCase().includes(needle));
  const regions = geo && value.country ? geo.regionsOf(value.country) : [];
  const chip = (on: boolean) =>
    `press flex shrink-0 snap-start items-center gap-2 rounded-2xl border px-4 py-2.5 text-[14px] font-semibold transition-all duration-300 [transition-timing-function:var(--ease-spring)] active:scale-95 ${on ? "scale-[1.03] border-brand-400 bg-brand-50 text-brand-700 shadow-[0_6px_16px_-6px_rgb(14_122_92/0.45)] ring-4 ring-brand-100" : "border-line bg-surface hover:-translate-y-0.5 hover:border-brand-300"}`;
  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <label htmlFor="country-q" className="sr-only">Search country</label>
          <input id="country-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your country" autoComplete="off" className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-4 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
        </div>
        <div className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1" role="radiogroup" aria-label="Country">
          {countries.map((c) => {
            const on = value.country === c.name;
            return (
              <button key={c.code} type="button" role="radio" aria-checked={on} onClick={() => { onChange({ country: c.name, region: "", currency: c.currency }); setQ(""); }} className={chip(on)}>
                <span className={`text-[18px] leading-none transition-transform duration-300 ${on ? "scale-110" : ""}`} aria-hidden="true">{c.flag}</span>
                {c.name}
                {on && <Check className="animate-pop h-4 w-4 text-brand-600" strokeWidth={3} />}
              </button>
            );
          })}
          {countries.length === 0 && <p className="py-2 text-[13px] text-muted">No country matches “{q.trim()}”.</p>}
        </div>
      </div>
      {regions.length > 0 && (
        <div className="animate-fade-up space-y-2.5">
          <p className="text-[13px] font-medium text-muted">State / region</p>
          <div className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1" role="radiogroup" aria-label="State or region">
            {regions.map((r) => {
              const on = value.region === r.name;
              return (
                <button key={r.code + r.name} type="button" role="radio" aria-checked={on} onClick={() => onChange({ country: value.country, region: r.name, currency: geo?.byName(value.country)?.currency ?? "" })} className={chip(on)}>
                  {r.name}
                  {on && <Check className="animate-pop h-4 w-4 text-brand-600" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [prices, setPrices] = useState<PriceValues>(EMPTY_PRICES);
  const [api, setApi] = useState({ instagram: "", youtube: "" });
  const [gateway, setGateway] = useState<Session["paymentGateway"]>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const isBiz = role === "business";
  const STEPS = 5;
  const [pricesLater, setPricesLater] = useState(false);
  const geo = useGeo();
  const kinds = priceKindsFor(earning);
  const num = (v: string) => (v ? Number(v) : undefined);
  const priced = (k: PriceKind) => (kinds.includes(k) && !pricesLater ? [num(prices[k].min), num(prices[k].max)] : [undefined, undefined]);

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
      if (!country) return setErrors({ location: "Pick your country." });
      if ((geo?.regionsOf(country).length ?? 0) > 0 && !region) return setErrors({ location: "Pick your state or region." });
      const bad = pricesLater ? undefined : kinds.find((k) => prices[k].min && prices[k].max && Number(prices[k].min) > Number(prices[k].max));
      if (bad) return setErrors({ [`pay_${bad}`]: "The minimum should be smaller than the maximum." });
    }
    if (step === 4) {
      const ig = apiLink.safeParse(api.instagram);
      const yt = apiLink.safeParse(api.youtube);
      if (!isBiz && (!ig.success || !yt.success)) return setErrors({ apiInstagram: ig.success ? "" : ig.error.issues[0]!.message, apiYoutube: yt.success ? "" : yt.error.issues[0]!.message });
      const [lo, hi] = priced("video");
      const [sLo, sHi] = priced("sale");
      const [vLo, vHi] = priced("views");
      const igLink = ig.success ? ig.data : undefined;
      const ytLink = yt.success ? yt.data : undefined;
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
          perSaleMin: sLo,
          perSaleMax: sHi,
          perThousandMin: vLo,
          perThousandMax: vHi,
          socialApi: !isBiz && (igLink || ytLink) ? { instagram: igLink, youtube: ytLink } : undefined,
          paymentGateway: isBiz ? gateway : undefined,
        },
      }));
      router.replace("/home");
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  return (
    <main className="min-h-dvh bg-surface md:grid md:place-items-center md:bg-canvas md:py-10">
      <form onSubmit={next} className="animate-fade-up mx-auto w-full max-w-md px-5 pb-28 pt-6 md:card md:max-w-xl md:p-8 lg:max-w-3xl" noValidate>
        <div className="mb-5 flex items-center gap-3">
          {step === 0 ? (
            <Link href="/" aria-label="Back" className="press -ml-2 grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-canvas"><ChevronLeft className="h-5 w-5" /></Link>
          ) : (
            <button type="button" onClick={() => { setErrors({}); setStep((s) => s - 1); }} aria-label="Back" className="press -ml-2 grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-canvas"><ChevronLeft className="h-5 w-5" /></button>
          )}
          <div className="flex flex-1 gap-1.5" aria-label={`Step ${step + 1} of ${STEPS}`}>
            {Array.from({ length: STEPS }, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-brand-500" : "bg-line"}`} />)}
          </div>
        </div>

        <div key={step} className="animate-fade-up">
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold tracking-tight">Who are you?</h1>
              <fieldset className="mt-5 grid grid-cols-2 gap-3">
                <legend className="sr-only">Account type</legend>
                {ROLES.map(({ id, title, icon: Icon }) => {
                  const selected = role === id;
                  const tone = id === "creator" ? "bg-brand-50 text-brand-600" : "bg-violet-50 text-violet-600";
                  return (
                    <label key={id} className={`press relative flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border px-3 py-5 transition-all duration-300 [transition-timing-function:var(--ease-spring)] ${selected ? "-translate-y-0.5 scale-[1.03] border-brand-400 bg-brand-50/40 shadow-[0_10px_24px_-12px_rgb(14_122_92/0.45)] ring-4 ring-brand-100" : "border-line hover:-translate-y-0.5 hover:shadow-sm"}`}>
                      <input type="radio" name="role" value={id} checked={selected} onChange={() => setRole(id)} className="sr-only" />
                      <span className={`grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-300 [transition-timing-function:var(--ease-spring)] ${tone} ${selected ? "scale-110 rotate-[-6deg]" : ""}`}><Icon className="h-6 w-6" /></span>
                      <span className="text-[13px] font-semibold">{title}</span>
                      {selected && <span className="animate-pop absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>}
                    </label>
                  );
                })}
              </fieldset>
              <div className="mt-5 space-y-3">
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
              <h1 className="mb-6 text-2xl font-bold tracking-tight">{isBiz ? "What does your business do?" : "What content do you create?"}</h1>
              <NichePicker value={niches} onChange={setNiches} />
              {errors.niches && <p role="alert" className="mt-3 text-[13px] text-danger">{errors.niches}</p>}
            </>
          )}

          {step === 2 && (
            <>
              {isBiz ? (
                <>
                  <h1 className="mb-6 text-2xl font-bold tracking-tight">What creators are you looking for?</h1>
                  <NichePicker value={lookingFor} onChange={setLookingFor} />
                  <h2 className="font-text mb-2 mt-8 font-semibold">How do you want to work with them?</h2>
                  <EarnPicker value={earning} onChange={setEarning} />
                </>
              ) : (
                <>
                  <h1 className="mb-6 text-2xl font-bold tracking-tight">How do you want to earn?</h1>
                  <EarnPicker value={earning} onChange={setEarning} />
                </>
              )}
              {errors.step2 && <p role="alert" className="mt-3 text-[13px] text-danger">{errors.step2}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <div className="animate-fade-up relative mb-6 aspect-[16/7] overflow-hidden rounded-2xl bg-elevated md:aspect-[16/6]">
                <Image src={photoSrc(STORY.shop, 900)} alt="" fill sizes="(min-width: 1024px) 768px, 100vw" priority className="object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />
                <h1 className="absolute inset-x-4 bottom-3.5 text-2xl font-bold tracking-tight text-white md:text-3xl">Almost there</h1>
              </div>
              <div className="space-y-6">
                <section className="space-y-3">
                  <p className="flex items-center gap-2 text-[14px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600"><MapPin className="h-4 w-4" /></span> Where are you based?</p>
                <div>
                  <LocationSlider
                    value={{ country, region }}
                    onChange={(v) => {
                      setCountry(v.country);
                      setRegion(v.region);
                      setCurrency(v.currency);
                      setErrors({});
                    }}
                  />
                  {errors.location && <p role="alert" className="animate-fade-up mt-2 text-[13px] text-danger">{errors.location}</p>}
                </div>
                </section>
                <section className="space-y-3">
                  <p className="flex items-center gap-2 text-[14px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600"><BadgeIndianRupee className="h-4 w-4" /></span> {isBiz ? "Your budget" : "Your rate"}</p>
                {kinds.length > 0 ? (
                  <>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={pricesLater}
                      onClick={() => { setPricesLater((v) => !v); setErrors({}); }}
                      className={`press group inline-flex h-10 origin-center items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-all duration-300 [transition-timing-function:var(--ease-spring)] active:scale-90 ${pricesLater ? "scale-105 border border-brand-400 bg-brand-50 text-brand-700 shadow-[0_6px_16px_-6px_rgb(14_122_92/0.45)] ring-4 ring-brand-100" : "border border-line bg-surface hover:-translate-y-0.5 hover:border-brand-300"}`}
                    >
                      <span className={`grid h-5 w-5 place-items-center rounded-md border-2 transition-all duration-300 ${pricesLater ? "scale-110 border-brand-600 bg-brand-600 text-white" : "border-line"}`} aria-hidden="true">
                        {pricesLater && <Check className="animate-pop h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      I&apos;ll think about it later
                    </button>
                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 [transition-timing-function:var(--ease-spring)] ${pricesLater ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`} aria-hidden={pricesLater}>
                      <div className="overflow-hidden">
                        <div className="pt-1">
                          <PriceFields
                            kinds={kinds}
                            currency={currency || DEFAULT_CURRENCY}
                            labels={{ video: isBiz ? "Your budget per video" : "What you charge per video" }}
                            value={prices}
                            onChange={(k, r) => { setPrices((p) => ({ ...p, [k]: r })); setErrors({}); }}
                            errors={{ video: errors.pay_video, sale: errors.pay_sale, views: errors.pay_views }}
                          />
                        </div>
                      </div>
                    </div>
                    {pricesLater && <p className="animate-fade-up text-[13px] text-muted">No problem. Add your prices any time from Edit Profile.</p>}
                  </>
                ) : (
                  <p className="text-[13px] text-muted">Free PR packages and product seeding are free, so there&apos;s no price to set.</p>
                )}
                </section>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-2xl font-bold tracking-tight">{isBiz ? "Connect your payments" : "Connect your social media"}</h1>
              <p className="animate-fade-up mb-6 mt-1 text-sm text-muted [animation-delay:80ms]">{isBiz ? "Track sales and earn real badges." : "Show your monthly views to brands."}</p>
              {isBiz ? (
                <PaymentGatewayConnect value={gateway} onChange={setGateway} />
              ) : (
                <SocialApiFields value={api} onChange={(v) => { setApi(v); setErrors({}); }} errors={{ instagram: errors.apiInstagram || undefined, youtube: errors.apiYoutube || undefined }} />
              )}
              <p className="mt-4 text-[12px] text-muted">Optional. You can add this later.</p>
            </>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-5 py-3 pb-safe backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <Button type="submit" size="lg" className="mx-auto w-full max-w-md md:max-w-none">
            {step === 4 ? <><Sparkles className="h-5 w-5" /> {(isBiz ? gateway : api.instagram || api.youtube) ? "Show my matches" : "Skip for now"}</> : "Continue"}
          </Button>
        </div>
      </form>
    </main>
  );
}
