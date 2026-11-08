"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Grid3x3, Link2, LogOut, Settings, Smartphone, Star, Wallet } from "lucide-react";
import { Avatar, TONES } from "@/components/art";
import { InstallGuide } from "@/components/install-prompt";
import { Button, DeviceNote, EmptyState, Field, Sheet, inputCls } from "@/components/ui";
import { formatINR } from "@/lib/format";
import { useBadges, useMoney, useMyPrograms } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export default function Profile() {
  const { session, posts, following, update, reset } = useStore();
  const { kind, summary } = useMoney();
  const programs = useMyPrograms();
  const earned = useBadges().filter((b) => b.earned).length;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(false);
  const [name, setName] = useState(session?.displayName ?? "");
  const [nameErr, setNameErr] = useState("");

  if (!session) return null;
  const myPosts = posts.filter((p) => p.authorHandle === session.handle);

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    const v = name.trim();
    if (v.length < 2 || v.length > 50) return setNameErr("Name must be 2–50 characters");
    update((s) => ({ ...s, session: s.session ? { ...s.session, displayName: v } : s.session }));
    setEditing(false);
  }

  function signOut() {
    if (!window.confirm("This clears all preview data saved on this device. Continue?")) return;
    reset();
    router.replace("/");
  }

  const tools = [
    { href: "/money", label: "Money", value: formatINR(summary.total), icon: Wallet, tone: "bg-emerald-50 text-emerald-600" },
    { href: "/affiliates", label: "Affiliates", value: `${programs.length} Program${programs.length === 1 ? "" : "s"}`, icon: Link2, tone: "bg-violet-50 text-violet-600" },
    { href: "/badges", label: "Badges", value: `${earned} Earned`, icon: Star, tone: "bg-amber-50 text-amber-500" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex justify-end">
        <button onClick={() => setSettings(true)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <section className="flex flex-col items-center text-center">
        <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} size="xl" square={session.role === "business"} />
        <h1 className="mt-3 text-lg font-bold">{session.displayName}</h1>
        <p className="text-sm text-muted">@{session.handle} · <span className="capitalize">{session.role}</span></p>
        <dl className="mt-4 grid w-full max-w-xs grid-cols-3 text-center">
          <div className="flex flex-col"><dt className="text-xs text-muted">Posts</dt><dd className="order-first font-bold">{myPosts.length}</dd></div>
          <div className="flex flex-col"><dt className="text-xs text-muted">Followers</dt><dd className="order-first font-bold">0</dd></div>
          <div className="flex flex-col"><dt className="text-xs text-muted">Following</dt><dd className="order-first font-bold">{following.length}</dd></div>
        </dl>
        <Button variant="secondary" size="sm" className="mt-4 w-full max-w-xs" onClick={() => setEditing(true)}>Edit Profile</Button>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3">
        {tools.map(({ href, label, value, icon: Icon, tone }) => (
          <Link key={href} href={href} className="card flex flex-col items-center p-3.5 text-center transition hover:border-brand-200">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <span className="mt-2 text-[13px] font-semibold">{label}</span>
            <span className="max-w-full truncate text-[11px] text-muted">{value}</span>
          </Link>
        ))}
      </section>
      <p className="mt-2 text-center text-[11px] text-muted">{kind === "income" ? "Income" : "Spending"} is private — only you can see it.</p>

      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Grid3x3 className="h-4 w-4" /> Posts</h2>
        {myPosts.length === 0 ? (
          <div className="card">
            <EmptyState icon={<Grid3x3 className="h-5 w-5" />} title="No posts yet" body="Share your first post so brands can see your work." action={<Link href="/create" className="text-sm font-semibold text-brand-700">Create a post</Link>} />
          </div>
        ) : (
          <ul className="grid grid-cols-3 gap-1.5">
            {myPosts.map((p) => (
              <li key={p.id} className={`grid aspect-square place-items-center overflow-hidden rounded-xl bg-gradient-to-br p-2 text-center text-[11px] font-medium text-ink/80 ${TONES[p.tone ?? "mint"].bg}`}>
                <span className="line-clamp-4">{p.caption}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit Profile">
        <form onSubmit={saveName} className="space-y-4" noValidate>
          <Field label="Name" error={nameErr}>
            <input className={inputCls} value={name} onChange={(e) => { setName(e.target.value); setNameErr(""); }} aria-invalid={!!nameErr} />
          </Field>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </Sheet>

      <Sheet open={settings} onClose={() => setSettings(false)} title="Settings">
        <div className="space-y-6">
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Smartphone className="h-4 w-4" /> Add to Home Screen</h3>
            <InstallGuide />
          </section>
          <section className="space-y-3 border-t border-line pt-4">
            <DeviceNote>Preview build — your profile, posts, records and programs are stored only in this browser.</DeviceNote>
            <Button variant="secondary" className="w-full text-rose-600" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out & clear preview data
            </Button>
          </section>
        </div>
      </Sheet>
    </div>
  );
}
