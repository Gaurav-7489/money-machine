"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Link2, Wallet } from "lucide-react";
import { TONES } from "@/components/art";
import { Button, DeviceNote, Field, inputCls } from "@/components/ui";
import { uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import { fieldErrors, postInput, type FieldErrors } from "@/lib/validation";
import type { Post } from "@/lib/types";

const TONE_KEYS = ["mint", "rose", "violet", "sky", "amber", "lime"] as const;

export default function Create() {
  const { session, update } = useStore();
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [tone, setTone] = useState<(typeof TONE_KEYS)[number]>("mint");
  const [errors, setErrors] = useState<FieldErrors>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = postInput.safeParse({ caption, tags });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    const post: Post = {
      id: uid("post"),
      authorHandle: session!.handle,
      caption: parsed.data.caption,
      tags: (parsed.data.tags ?? "")
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, "").toLowerCase())
        .filter(Boolean)
        .slice(0, 10),
      tone,
      createdAt: new Date().toISOString(),
    };
    update((s) => ({ ...s, posts: [post, ...s.posts] }));
    router.push("/home");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form onSubmit={submit} className="card p-5" noValidate>
        <h1 className="mb-4 text-xl font-bold tracking-tight">New post</h1>
        <div className={`mb-4 grid aspect-[4/3] place-items-center rounded-2xl bg-gradient-to-br px-6 text-center ${TONES[tone].bg}`}>
          <p className="text-lg font-semibold text-ink/80">{caption || "Your post preview"}</p>
        </div>
        <div className="mb-4 flex gap-2" role="radiogroup" aria-label="Background">
          {TONE_KEYS.map((t) => (
            <button
              type="button"
              key={t}
              role="radio"
              aria-checked={tone === t}
              aria-label={t}
              onClick={() => setTone(t)}
              className={`h-8 w-8 rounded-full bg-gradient-to-br ${TONES[t].bg} ${tone === t ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
            />
          ))}
        </div>
        <div className="space-y-4">
          <Field label="Caption" error={errors.caption}>
            <textarea className={`${inputCls} min-h-24`} value={caption} onChange={(e) => setCaption(e.target.value)} aria-invalid={!!errors.caption} maxLength={2200} />
          </Field>
          <Field label="Tags" hint="Separate with spaces, e.g. #collab #skincare">
            <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
          <DeviceNote>Photo and video uploads arrive with cloud storage. Text posts are saved on this device in the preview.</DeviceNote>
          <Button type="submit" className="w-full">Share post</Button>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted">Other things you can create</p>
        {session?.role === "business" && (
          <Link href="/affiliates/new" className="card flex items-center gap-3 p-4 hover:border-brand-200">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><Link2 className="h-5 w-5" /></span>
            <span className="flex-1 text-sm font-semibold">Affiliate program</span>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Link>
        )}
        <Link href="/money?add=1" className="card flex items-center gap-3 p-4 hover:border-brand-200">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Wallet className="h-5 w-5" /></span>
          <span className="flex-1 text-sm font-semibold">{session?.role === "business" ? "Spending record" : "Income record"}</span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      </div>
    </div>
  );
}
