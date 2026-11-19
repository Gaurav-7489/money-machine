"use client";

import { TabIndicator } from "@/components/motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AtSign, Bookmark, Grid3x3, Link2, LogOut, Mail, MapPin, Palette, Pencil, Repeat2, Rocket, Settings, Smartphone, Star, Users, Wallet } from "lucide-react";
import { Avatar, TONES } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { PostCard } from "@/components/feed/post-card";
import { InstallGuide } from "@/components/install-prompt";
import { ThemePicker } from "@/components/theme";
import { Button, EmptyState, Field, Sheet, inputCls, selectCls } from "@/components/ui";
import { COUNTRIES, EARNING_MODELS, LOCATIONS, NICHES, earningLabel } from "@/lib/catalog";
import { useFeed } from "@/lib/feed";
import { formatINR } from "@/lib/format";
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
  city: string;
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
    city: s.city ?? "",
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
    { done: !!s.city, label: "Add your city" },
    { done: s.priceFrom !== undefined || s.priceTo !== undefined, label: "Add your pay per video" },
    { done: (s.earningModels ?? []).length > 0, label: s.role === "business" ? "Choose how you work with creators" : "Choose how you earn" },
    { done: !!(s.instagram || s.youtube || s.x), label: "Add a social media handle" },
  ];
  return { percent: Math.round((steps.filter((x) => x.done).length / steps.length) * 100), next: steps.find((x) => !x.done) };
}

function ChipField({ label, options, value, onChange }: { label: string; options: { id: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium">{label} <span className="ml-1 rounded-full bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-line">Optional</span></p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <button key={o.id} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])} className={`press h-9 rounded-full px-3 text-[13px] font-semibold ${on ? "bg-action text-on-accent" : "border border-line bg-surface hover:bg-elevated"}`}>
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
    setForm((f) => ({ ...f, [k]: e.target.value, ...(k === "country" ? { city: "" } : {}) }));
    setErrors((x) => ({ ...x, [k]: "" }));
  };
  const isBiz = session.role === "business";
  const cities = form.country ? LOCATIONS[form.country] ?? [] : [];

  function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileInput.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    update((s) => (s.session ? { ...s, session: { ...s.session, ...parsed.data, category: parsed.data.niches[0] ?? parsed.data.category, payPerVideoMin: parsed.data.priceFrom, payPerVideoMax: parsed.data.priceTo } } : s));
    toast("Profile saved!");
    onDone();
  }

  return (
    <form onSubmit={save} className="space-y-5" noValidate>
      <section className="space-y-4">
        <h3 className="text-sm font-bold">About you</h3>
        <Field label={isBiz ? "Brand name" : "Name"} error={errors.displayName}>
          <input className={inputCls} value={form.displayName} onChange={set("displayName")} aria-invalid={!!errors.displayName} />
        </Field>
        <Field label="Bio" optional error={errors.bio} hint={`${form.bio.length}/160`}>
          <textarea className={`${inputCls} min-h-20`} maxLength={160} value={form.bio} onChange={set("bio")} placeholder={isBiz ? "e.g. Clean skincare made in India." : "e.g. Fitness creator sharing 20-minute home workouts."} />
        </Field>
        <ChipField label={isBiz ? "What your business does" : "Content you create"} options={NICHES.map((n) => ({ id: n, label: n }))} value={form.niches} onChange={(v) => setForm((f) => ({ ...f, niches: v }))} />
        {isBiz && <ChipField label="Creators you're looking for" options={NICHES.map((n) => ({ id: n, label: n }))} value={form.lookingFor} onChange={(v) => setForm((f) => ({ ...f, lookingFor: v }))} />}
        <div className="grid grid-cols-2 gap-2">
          <Field label="Country" optional>
            <select className={selectCls} value={form.country} onChange={set("country")}>
              <option value="">Choose</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="City" optional>
            <select className={selectCls} value={form.city} onChange={set("city")} disabled={!form.country}>
              <option value="">{form.country ? "Choose" : "Pick a country first"}</option>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-4">
        <h3 className="flex items-center gap-1 text-sm font-bold">
          Working together
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Field label={isBiz ? "Budget per video from ₹" : "Pay per video from ₹"} optional error={errors.priceFrom}>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 2000" value={form.priceFrom} onChange={set("priceFrom")} aria-invalid={!!errors.priceFrom} />
          </Field>
          <Field label="To ₹" optional error={errors.priceTo}>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 10000" value={form.priceTo} onChange={set("priceTo")} aria-invalid={!!errors.priceTo} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label={isBiz ? "Commission you pay %" : "Commission you ask %"} optional error={errors.commissionPercent}>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 15" value={form.commissionPercent} onChange={set("commissionPercent")} aria-invalid={!!errors.commissionPercent} />
          </Field>
          <Field label={isBiz ? "You pay per sale ₹" : "You ask per sale ₹"} optional error={errors.perSale}>
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
                  className={`press h-9 rounded-full px-3 text-[13px] font-semibold ${on ? "bg-action text-on-accent" : "border border-line bg-surface hover:bg-elevated"}`}
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

  const tools = [
    isBiz
      ? { href: "/money", label: "Profit", value: `${growth.profit < 0 ? "−" : ""}${formatINR(Math.abs(growth.profit))}`, icon: Rocket, tone: "bg-action text-on-accent" }
      : { href: "/money", label: "Earned", value: formatINR(summary.total), icon: Wallet, tone: "bg-action text-on-accent" },
    { href: "/affiliates", label: isBiz ? "Programs running" : "Programs joined", value: String(programs.length), icon: Link2, tone: "bg-brand-50 text-brand-700" },
    { href: "/badges", label: "Badges earned", value: String(earned), icon: Star, tone: "bg-accent-soft text-accent" },
  ];
  const socials = [
    ["Instagram", session.instagram],
    ["YouTube", session.youtube],
    ["X", session.x],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setSettings(true)} className="h-10 px-3 text-sm">
          <Settings className="h-5 w-5" /> Settings
        </Button>
      </div>
      <section className="card flex flex-col items-center p-5 text-center">
        <Avatar name={session.displayName} tone={isBiz ? "violet" : "rose"} size="xl" square={isBiz} />
        <h1 className="mt-3 text-xl font-bold">{session.displayName}</h1>
        <p className="text-sm text-muted">@{session.handle} · {isBiz ? "Business" : "Creator"}</p>
        {session.bio && <p className="mt-2 max-w-md text-[15px]">{session.bio}</p>}
        {session.city && (
          <p className="mt-2 flex items-center gap-1 text-sm text-muted"><MapPin className="h-4 w-4" /> {session.city}, {session.country}</p>
        )}
        {(session.niches ?? []).length > 0 && (
          <p className="mt-2 flex flex-wrap justify-center gap-1.5">
            {session.niches!.map((n) => <span key={n} className="bg-brand-50 rounded-full px-2.5 py-0.5 text-xs font-semibold text-brand-700">{n}</span>)}
          </p>
        )}
        {isBiz && (session.lookingFor ?? []).length > 0 && <p className="mt-2 text-xs text-muted">Looking for: <span className="font-semibold text-ink">{session.lookingFor!.join(", ")}</span> creators</p>}
        {(socials.length > 0 || session.email) && (
          <ul className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
            {socials.map(([k, v]) => (
              <li key={k} className="inline-flex items-center gap-1 rounded-full bg-elevated px-2.5 py-1 ring-1 ring-line"><AtSign className="h-3 w-3" /> {k}: <span className="font-semibold">{v}</span></li>
            ))}
            {session.email && <li className="inline-flex items-center gap-1 rounded-full bg-elevated px-2.5 py-1 ring-1 ring-line"><Mail className="h-3 w-3" /> {session.email}</li>}
          </ul>
        )}
        {(session.earningModels ?? []).length > 0 && (
          <p className="mt-2 flex flex-wrap justify-center gap-1.5">
            {session.earningModels!.map((m) => <span key={m} className="rounded-full bg-elevated px-2.5 py-0.5 text-xs font-medium text-muted ring-1 ring-line">{earningLabel(m)}</span>)}
          </p>
        )}
        <dl className="mt-4 grid w-full max-w-sm grid-cols-3 text-center">
          <div className="flex flex-col"><dt className="text-xs text-muted">Posts</dt><dd className="order-first text-lg font-bold">{myPosts.length}</dd></div>
          <div className="flex flex-col">
            <dt className="flex items-center justify-center gap-0.5 text-xs text-muted">Reposts</dt>
            <dd className="order-first text-lg font-bold">{reposts.length}</dd>
          </div>
          <Link href="/friends" className="flex flex-col rounded-xl hover:bg-elevated"><dt className="text-xs text-muted">Friends</dt><dd className="order-first text-lg font-bold">{following.length}</dd></Link>
        </dl>
        <Button variant="secondary" className="mt-4 w-full max-w-sm" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" /> Edit Profile
        </Button>
      </section>

      {done.percent < 100 && (
        <section className="card mt-4 p-4">
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold">Your profile is {done.percent}% complete</p>
            <button onClick={() => setEditing(true)} className="font-semibold text-brand-700 hover:underline">Finish it</button>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-elevated ring-1 ring-line" role="progressbar" aria-valuenow={done.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
            <div className="h-full rounded-full bg-action transition-[width] duration-700" style={{ width: `${done.percent}%` }} />
          </div>
          {done.next && <p className="mt-2 text-xs text-muted">Next step: {done.next.label}</p>}
        </section>
      )}

      <section className="mt-4 grid grid-cols-3 gap-3">
        {tools.map(({ href, label, value, icon: Icon, tone }) => (
          <Link key={href} href={href} className="card lift flex flex-col items-center p-3.5 text-center hover:border-brand-200">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <span className="mt-2 max-w-full truncate text-base font-bold">{value}</span>
            <span className="text-[12px] leading-tight text-muted">{label}</span>
          </Link>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <Link href="/friends" className="card lift flex items-center gap-3 p-3.5 hover:border-brand-200">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-elevated text-muted"><Users className="h-5 w-5" /></span>
          <span><span className="block text-sm font-semibold">Friends</span><span className="block text-xs text-muted">{following.length} {following.length === 1 ? "friend" : "friends"}</span></span>
        </Link>
        <Link href="/saved" className="card lift flex items-center gap-3 p-3.5 hover:border-brand-200">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent"><Bookmark className="h-5 w-5" /></span>
          <span><span className="block text-sm font-semibold">Saved</span><span className="block text-xs text-muted">{savedProfiles.length + saved.length} items</span></span>
        </Link>
      </section>

      <section className="mt-6">
        <div role="tablist" aria-label="Your content" className="mb-3 flex border-b border-line">
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
            <div className="card">
              <EmptyState icon={<Grid3x3 className="h-5 w-5" />} title="No posts yet" body="Share your first post so others can see your work." action={<Link href="/create" className="inline-flex h-11 items-center rounded-full bg-brand-50 px-5 text-sm font-semibold text-brand-700">Create a post</Link>} />
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-1.5">
              {myPosts.map((p) => (
                <li key={p.id}>
                  <Link href={`/home#${p.id}`} className={`lift relative grid aspect-square place-items-center overflow-hidden rounded-xl p-2 text-center text-[11px] font-medium text-ink/80 ${TONES[p.tone ?? "mint"].bg}`} aria-label={p.caption}>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
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
            <div className="space-y-5">{reposted.map((p) => <PostCard key={p.id} post={p} />)}</div>
          ) : (
            <div className="card">
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
