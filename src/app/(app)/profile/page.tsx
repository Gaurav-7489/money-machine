"use client";

import { TabIndicator } from "@/components/motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AtSign, Bookmark, Camera, ChevronRight, Grid3x3, Link2, LogOut, Mail, MapPin, Palette, Pencil, Repeat2, Rocket, Settings, Smartphone, Star, Users, Wallet } from "lucide-react";
import { Photo } from "@/components/photo";
import { nichePhoto } from "@/lib/photos";
import { Avatar, TONES } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { PostCard } from "@/components/feed/post-card";
import { InstallGuide } from "@/components/install-prompt";
import { ThemePicker } from "@/components/theme";
import { Button, EmptyState, Field, Sheet, inputCls, selectCls } from "@/components/ui";
import { EARNING_MODELS, NICHES, earningLabel } from "@/lib/catalog";
import { LocationPicker } from "@/components/location-picker";
import { ImageSlot, MediaImage } from "@/components/image-slot";
import { DEFAULT_CURRENCY, currencySymbol, formatMoney } from "@/lib/format";
import { useFeed } from "@/lib/feed";
import { useBadges, useGrowth, useMoney, useMyPrograms } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import type { Session } from "@/lib/types";
import { fieldErrors, profileInput, type FieldErrors } from "@/lib/validation";

type Form = {
  displayName: string;
  bio: string;
  category: string;
  niches: string[];
  lookingFor: string[];
  commissionPercent: string;
  country: string;
  region: string;
  city: string;
  currency: string;
  priceFrom: string;
  priceTo: string;
  perSale: string;
  earningModels: string[];
  instagram: string;
  youtube: string;
  x: string;
  email: string;
};

function toForm(s: Session): Form {
  const str = (v: number | undefined) => (v === undefined ? "" : String(v));
  return {
    displayName: s.displayName,
    bio: s.bio ?? "",
    category: s.category ?? "",
    niches: s.niches ?? (s.category ? [s.category] : []),
    lookingFor: s.lookingFor ?? [],
    commissionPercent: str(s.commissionPercent),
    country: s.country ?? "",
    region: s.region ?? "",
    city: s.city ?? "",
    currency: s.currency ?? DEFAULT_CURRENCY,
    priceFrom: str(s.priceFrom),
    priceTo: str(s.priceTo),
    perSale: str(s.perSale),
    earningModels: s.earningModels ?? [],
    instagram: s.instagram ?? "",
    youtube: s.youtube ?? "",
    x: s.x ?? "",
    email: s.email ?? "",
  };
}

/** Which profile details help others find you; used for the completeness meter. */
function completeness(s: Session) {
  const steps = [
    { done: !!s.bio, label: "Add a short bio" },
    { done: (s.niches ?? []).length > 0 || !!s.category, label: "Pick your niches" },
    { done: !!s.country, label: "Add where you're based" },
    { done: s.priceFrom !== undefined || s.priceTo !== undefined, label: "Add your pay per video" },
    { done: (s.earningModels ?? []).length > 0, label: s.role === "business" ? "Choose how you work with creators" : "Choose how you earn" },
    { done: !!(s.instagram || s.youtube || s.x), label: "Add a social media handle" },
  ];
  return { percent: Math.round((steps.filter((x) => x.done).length / steps.length) * 100), next: steps.find((x) => !x.done) };
}

function ChipField({ label, options, value, onChange }: { label: string; options: { id: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium">{label} <span className="font-normal text-muted">(optional)</span></p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <button key={o.id} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])} className={`press h-9 rounded-full px-3 text-[13px] font-semibold ${on ? "bg-aurora text-on-accent" : "border border-line bg-surface hover:bg-elevated"}`}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EditProfile({ session, onDone }: { session: Session; onDone: () => void }) {
  const { update } = useStore();
  const { toast } = useFeedback();
  const [form, setForm] = useState<Form>(() => toForm(session));
  const [errors, setErrors] = useState<FieldErrors>({});
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: "" }));
  };
  const isBiz = session.role === "business";
  const sym = currencySymbol(form.currency);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileInput.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    update((s) => (s.session ? { ...s, session: { ...s.session, ...parsed.data, region: form.region || undefined, currency: form.currency || DEFAULT_CURRENCY, category: parsed.data.niches[0] ?? parsed.data.category, payPerVideoMin: parsed.data.priceFrom, payPerVideoMax: parsed.data.priceTo } } : s));
    toast("Profile saved!");
    onDone();
  }

  return (
    <form onSubmit={save} className="space-y-5" noValidate>
      <section className="space-y-4">
        <ImageSlot label="Profile photo" round id={session.avatarId} onChange={(id) => update((s) => (s.session ? { ...s, session: { ...s.session, avatarId: id } } : s))} />
        <ImageSlot label="Cover photo" id={session.coverId} onChange={(id) => update((s) => (s.session ? { ...s, session: { ...s.session, coverId: id } } : s))} />
      </section>
      <section className="space-y-4 border-t border-line pt-4">
        <h3 className="text-sm font-bold">About you</h3>
        <Field label={isBiz ? "Brand name" : "Name"} error={errors.displayName}>
          <input className={inputCls} value={form.displayName} onChange={set("displayName")} aria-invalid={!!errors.displayName} />
        </Field>
        <Field label="Bio" optional error={errors.bio} hint={`${form.bio.length}/160`}>
          <textarea className={`${inputCls} min-h-20`} maxLength={160} value={form.bio} onChange={set("bio")} placeholder={isBiz ? "e.g. Clean skincare made in India." : "e.g. Fitness creator sharing 20-minute home workouts."} />
        </Field>
        <ChipField label={isBiz ? "What your business does" : "Content you create"} options={NICHES.map((n) => ({ id: n, label: n }))} value={form.niches} onChange={(v) => setForm((f) => ({ ...f, niches: v }))} />
        {isBiz && <ChipField label="Creators you're looking for" options={NICHES.map((n) => ({ id: n, label: n }))} value={form.lookingFor} onChange={(v) => setForm((f) => ({ ...f, lookingFor: v }))} />}
        <LocationPicker value={{ country: form.country, region: form.region }} onChange={(v) => setForm((f) => ({ ...f, country: v.country, region: v.region, currency: v.currency || f.currency }))} />
        <Field label="City" optional>
          <input className={inputCls} value={form.city} onChange={set("city")} placeholder="e.g. Pune" maxLength={60} />
        </Field>
        {form.country && <p className="text-[12px] text-muted">Amounts on your account are shown in {form.currency} ({sym}).</p>}
      </section>

      <section className="space-y-4 border-t border-line pt-4">
        <h3 className="flex items-center gap-1 text-sm font-bold">
          Working together
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Field label={`${isBiz ? "Budget per video from" : "Pay per video from"} ${sym}`} optional error={errors.priceFrom}>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 2000" value={form.priceFrom} onChange={set("priceFrom")} aria-invalid={!!errors.priceFrom} />
          </Field>
          <Field label={`To ${sym}`} optional error={errors.priceTo}>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 10000" value={form.priceTo} onChange={set("priceTo")} aria-invalid={!!errors.priceTo} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label={isBiz ? "Commission you pay %" : "Commission you ask %"} optional error={errors.commissionPercent}>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 15" value={form.commissionPercent} onChange={set("commissionPercent")} aria-invalid={!!errors.commissionPercent} />
          </Field>
          <Field label={`${isBiz ? "You pay per sale" : "You ask per sale"} ${sym}`} optional error={errors.perSale}>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 100" value={form.perSale} onChange={set("perSale")} aria-invalid={!!errors.perSale} />
          </Field>
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-medium">{isBiz ? "How you work with creators" : "Means of earning"}</p>
          <div className="flex flex-wrap gap-1.5">
            {EARNING_MODELS.map((m) => {
              const on = form.earningModels.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  title={m.hint}
                  onClick={() => setForm((f) => ({ ...f, earningModels: on ? f.earningModels.filter((x) => x !== m.id) : [...f.earningModels, m.id] }))}
                  className={`press h-9 rounded-full px-3 text-[13px] font-semibold ${on ? "bg-aurora text-on-accent" : "border border-line bg-surface hover:bg-elevated"}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-4">
        <h3 className="text-sm font-bold">Social media & contact</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <Field label="Instagram" optional error={errors.instagram}>
            <input className={inputCls} autoCapitalize="none" placeholder="@yourname" value={form.instagram} onChange={set("instagram")} aria-invalid={!!errors.instagram} />
          </Field>
          <Field label="YouTube" optional error={errors.youtube}>
            <input className={inputCls} autoCapitalize="none" placeholder="@yourchannel" value={form.youtube} onChange={set("youtube")} aria-invalid={!!errors.youtube} />
          </Field>
          <Field label="X (Twitter)" optional error={errors.x}>
            <input className={inputCls} autoCapitalize="none" placeholder="@yourname" value={form.x} onChange={set("x")} aria-invalid={!!errors.x} />
          </Field>
        </div>
        <Field label="Public email" optional error={errors.email}>
          <input type="email" className={inputCls} autoCapitalize="none" placeholder="name@example.com" value={form.email} onChange={set("email")} aria-invalid={!!errors.email} />
        </Field>
      </section>

      <div className="sticky bottom-0 -mx-5 flex gap-2 border-t border-line bg-surface px-5 py-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onDone}>Cancel</Button>
        <Button type="submit" className="flex-1">Save</Button>
      </div>
    </form>
  );
}

export default function Profile() {
  const { session, posts, following, reposts, saved, savedProfiles, reset } = useStore();
  const { summary } = useMoney();
  const growth = useGrowth();
  const programs = useMyPrograms();
  const earned = useBadges().filter((b) => b.earned).length;
  const feed = useFeed();
  const router = useRouter();
  const { confirm } = useFeedback();
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(false);
  const [tab, setTab] = useState<"posts" | "reposts">("posts");

  if (!session) return null;
  const myPosts = posts.filter((p) => p.authorHandle === session.handle);
  const reposted = feed.filter((p) => reposts.includes(p.id));
  const isBiz = session.role === "business";
  const done = completeness(session);

  async function signOut() {
    const ok = await confirm({
      title: "Sign out and clear your data?",
      body: "In this preview your profile, posts, messages and money records are stored only on this device. Signing out deletes them. This can't be undone.",
      confirmLabel: "Sign out & clear",
      danger: true,
    });
    if (!ok) return;
    reset();
    router.replace("/");
  }

  const money = (v: number) => formatMoney(v, session.currency);
  const tools = [
    isBiz
      ? { href: "/money", label: "Profit", value: `${growth.profit < 0 ? "−" : ""}${money(Math.abs(growth.profit))}`, icon: Rocket }
      : { href: "/money", label: "Earned", value: money(summary.total), icon: Wallet },
    { href: "/affiliates", label: isBiz ? "Programs running" : "Programs joined", value: String(programs.length), icon: Link2 },
    { href: "/badges", label: "Badges earned", value: String(earned), icon: Star },
  ];
  const socials = [
    ["Instagram", session.instagram],
    ["YouTube", session.youtube],
    ["X", session.x],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="relative -mx-4 aspect-[16/9] overflow-hidden bg-elevated md:mx-0 md:aspect-[21/7] md:rounded-[22px]">
        <MediaImage id={session.coverId} alt="Your cover photo" className="absolute inset-0 h-full w-full" fallback={<Photo photo={nichePhoto(session.niches?.[0] ?? session.category)} sizes="(min-width: 1024px) 1024px, 100vw" priority decorative />} />
        <span className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/15" aria-hidden="true" />
        <div className="absolute right-3 top-3 flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="glass h-9 px-3.5 text-[13px]" aria-label="Change profile and cover photos">
            <Camera className="h-4 w-4" /> Photos
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSettings(true)} className="glass h-9 px-3.5 text-[13px]">
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <section className="md:col-span-7" aria-label="About you">
          <span className="relative z-10 -mt-10 inline-block rounded-full bg-canvas p-1.5 md:-mt-12" style={{ borderRadius: isBiz ? "30%" : undefined }}>
            <Avatar name={session.displayName} tone={isBiz ? "violet" : "rose"} size="xl" square={isBiz} photoId={session.avatarId} />
          </span>
          <h1 className="mt-4 text-[clamp(1.75rem,5vw,2.5rem)] leading-[0.88]">{session.displayName}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
            <span>@{session.handle}</span>
            <span className="rounded-full border border-line px-2 py-px text-[12px] font-medium text-ink">{isBiz ? "Business" : "Creator"}</span>
            {session.country && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {[session.city, session.region, session.country].filter(Boolean).join(", ")}</span>}
          </p>
          {session.bio && <p className="mt-6 max-w-[34ch] text-[clamp(1.35rem,2.6vw,1.75rem)] font-medium leading-snug tracking-[-0.015em]">{session.bio}</p>}
          {(session.niches ?? []).length > 0 && (
            <p className="mt-5 flex flex-wrap gap-1.5">
              {session.niches!.map((n) => <span key={n} className="rounded-full bg-elevated px-3 py-1 text-[13px] font-medium">{n}</span>)}
            </p>
          )}
          {isBiz && (session.lookingFor ?? []).length > 0 && <p className="mt-3 text-[13px] text-muted">Looking for <span className="font-medium text-ink">{session.lookingFor!.join(", ")}</span> creators</p>}
          {(socials.length > 0 || session.email) && (
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
              {socials.map(([k, v]) => (
                <li key={k} className="inline-flex items-center gap-1"><AtSign className="h-3 w-3" /> {k} <span className="font-medium text-ink">{v}</span></li>
              ))}
              {session.email && <li className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> <span className="font-medium text-ink">{session.email}</span></li>}
            </ul>
          )}
          {(session.earningModels ?? []).length > 0 && (
            <p className="mt-4 flex flex-wrap gap-1.5">
              {session.earningModels!.map((m) => <span key={m} className="rounded-full border border-line px-2.5 py-0.5 text-[12px] font-medium text-muted">{earningLabel(m)}</span>)}
            </p>
          )}
          <dl className="mt-8 grid max-w-sm grid-cols-3 border-y border-line">
            <div className="flex flex-col py-3"><dt className="text-[12px] text-muted">Posts</dt><dd className="font-display order-first text-[32px] leading-none tabular-nums">{myPosts.length}</dd></div>
            <div className="flex flex-col border-l border-line py-3 pl-4"><dt className="text-[12px] text-muted">Reposts</dt><dd className="font-display order-first text-[32px] leading-none tabular-nums">{reposts.length}</dd></div>
            <Link href="/friends" className="flex flex-col border-l border-line py-3 pl-4 transition-colors hover:bg-elevated"><dt className="text-[12px] text-muted">Friends</dt><dd className="font-display order-first text-[32px] leading-none tabular-nums">{following.length}</dd></Link>
          </dl>
          <Button variant="secondary" size="lg" className="mt-6" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
        </section>

        <aside className="space-y-8 md:col-span-5 md:pt-14" aria-label="Your tools">
          {done.percent < 100 && (
            <section className="border-t border-line pt-3">
              <div className="flex items-baseline justify-between text-[14px]">
                <p className="font-semibold">Your profile is {done.percent}% complete</p>
                <button onClick={() => setEditing(true)} className="link-draw font-medium">Finish it</button>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated" role="progressbar" aria-valuenow={done.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
                <div className="h-full rounded-full bg-signal transition-[width] duration-700" style={{ width: `${done.percent}%` }} />
              </div>
              {done.next && <p className="mt-2 text-[13px] text-muted">Next step: {done.next.label}</p>}
            </section>
          )}

          <section className="border-t border-line pt-3">
            <h2 className="font-text text-[14px] font-semibold">Your numbers</h2>
            <ul className="mt-2 divide-y divide-line border-b border-line">
              {tools.map(({ href, label, value, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="group flex items-center gap-3 py-3.5">
                    <Icon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.7} />
                    <span className="flex-1 text-[14px] text-muted">{label}</span>
                    <span className="font-display text-[26px] leading-none tabular-nums">{value}</span>
                    <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/friends" className="group flex items-center gap-3 py-3.5">
                  <Users className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.7} />
                  <span className="flex-1 text-[14px] text-muted">Friends</span>
                  <span className="text-[14px] font-medium tabular-nums">{following.length} {following.length === 1 ? "friend" : "friends"}</span>
                  <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link href="/saved" className="group flex items-center gap-3 py-3.5">
                  <Bookmark className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.7} />
                  <span className="flex-1 text-[14px] text-muted">Saved</span>
                  <span className="text-[14px] font-medium tabular-nums">{savedProfiles.length + saved.length} items</span>
                  <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>

      <section className="mt-16">
        <div role="tablist" aria-label="Your content" className="mb-4 flex border-b border-line">
          {([["posts", "Posts", Grid3x3, myPosts.length], ["reposts", "Reposts", Repeat2, reposted.length]] as const).map(([id, label, Icon, n]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-1.5 px-4 pb-3 text-sm ${tab === id ? "font-semibold" : "text-muted hover:text-ink"}`}
            >
              <Icon className="h-4 w-4" /> {label} ({n})
              {tab === id && <TabIndicator group="profile" />}
            </button>
          ))}
        </div>
        {tab === "posts" &&
          (myPosts.length === 0 ? (
            <div>
              <EmptyState icon={<Grid3x3 className="h-5 w-5" />} title="No posts yet" body="Share your first post so others can see your work." action={<Link href="/create" className="press inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary">Create a post</Link>} />
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-1.5 md:grid-cols-4">
              {myPosts.map((p) => (
                <li key={p.id}>
                  <Link href={`/home#${p.id}`} className={`group relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[14px] bg-gradient-to-br p-3 text-center text-[13px] font-medium ${TONES[p.tone ?? "mint"].bg} ${TONES[p.tone ?? "mint"].fg}`} aria-label={p.caption}>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="photo-zoom absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <span className="line-clamp-4">{p.caption}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        {tab === "reposts" &&
          (reposted.length ? (
            <div className="max-w-2xl">{reposted.map((p) => <PostCard key={p.id} post={p} />)}</div>
          ) : (
            <div>
              <EmptyState icon={<Repeat2 className="h-5 w-5" />} title="No reposts yet" body="Tap Repost under a post in your feed to share it on your profile." />
            </div>
          ))}
      </section>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit Profile">
        {editing && <EditProfile session={session} onDone={() => setEditing(false)} />}
      </Sheet>

      <Sheet open={settings} onClose={() => setSettings(false)} title="Settings">
        <div className="space-y-6">
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Palette className="h-4 w-4" /> Theme</h3>
            <ThemePicker />
          </section>
          <section className="border-t border-line pt-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Smartphone className="h-4 w-4" /> Add to Home Screen</h3>
            <InstallGuide />
          </section>
          <section className="space-y-3 border-t border-line pt-4">
            <Button variant="secondary" className="w-full text-danger" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out & clear preview data
            </Button>
          </section>
        </div>
      </Sheet>
    </div>
  );
}
