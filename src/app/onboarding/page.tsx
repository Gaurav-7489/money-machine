"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Check, UserRound } from "lucide-react";
import { Button, DeviceNote, Field, PageHeader, inputCls } from "@/components/ui";
import { useStore } from "@/lib/store";
import { fieldErrors, onboardingInput, type FieldErrors } from "@/lib/validation";
import type { Role } from "@/lib/types";

const ROLES: { id: Role; title: string; body: string; icon: typeof UserRound; tone: string }[] = [
  { id: "creator", title: "Creator", body: "Create content, collaborate and earn.", icon: UserRound, tone: "bg-brand-50 text-brand-600" },
  { id: "business", title: "Business", body: "Find creators, run campaigns and grow your brand.", icon: Briefcase, tone: "bg-violet-50 text-violet-600" },
];

export default function ChooseRole() {
  const router = useRouter();
  const { update } = useStore();
  const [role, setRole] = useState<Role>("creator");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = onboardingInput.safeParse({ role, displayName, handle });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setBusy(true);
    update((s) => ({ ...s, session: { ...parsed.data, createdAt: new Date().toISOString() } }));
    router.replace("/home");
  }

  return (
    <main className="min-h-dvh bg-white md:grid md:place-items-center md:bg-canvas">
      <form onSubmit={submit} className="mx-auto w-full max-w-md px-5 py-6 md:card md:p-8" noValidate>
        <PageHeader title="" back="/" />
        <h1 className="text-2xl font-bold tracking-tight">Who are you?</h1>
        <p className="mt-1 text-sm text-muted">Choose what best describes you.</p>

        <fieldset className="mt-6 space-y-3">
          <legend className="sr-only">Account type</legend>
          {ROLES.map(({ id, title, body, icon: Icon, tone }) => {
            const selected = role === id;
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${selected ? "border-brand-400 bg-brand-50/50 ring-4 ring-brand-100" : "border-line hover:bg-canvas"}`}
              >
                <input type="radio" name="role" value={id} checked={selected} onChange={() => setRole(id)} className="sr-only" />
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-muted">{body}</span>
                </span>
                <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${selected ? "border-brand-600 bg-brand-600 text-white" : "border-line"}`}>
                  {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="mt-6 space-y-4">
          <Field label={role === "business" ? "Brand name" : "Your name"} error={errors.displayName}>
            <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} aria-invalid={!!errors.displayName} autoComplete="name" />
          </Field>
          <Field label="Username" error={errors.handle} hint="This is how people find you.">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">@</span>
              <input className={`${inputCls} pl-8`} value={handle} onChange={(e) => setHandle(e.target.value)} aria-invalid={!!errors.handle} autoCapitalize="none" autoComplete="username" />
            </div>
          </Field>
        </div>

        <div className="mt-5">
          <DeviceNote>Preview build: your profile is saved on this device only. Secure accounts arrive with sign-in.</DeviceNote>
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
          {busy ? "Setting up…" : "Continue"}
        </Button>
      </form>
    </main>
  );
}
