"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronRight, ImagePlus, Link2, Loader2, Wallet, X } from "lucide-react";
import { TONES } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { Button, Field, inputCls } from "@/components/ui";
import { compressImage, usePublishPost } from "@/lib/posts";
import { useStore } from "@/lib/store";
import type { FieldErrors } from "@/lib/validation";

const TONE_KEYS = ["mint", "rose", "violet", "sky", "amber", "lime"] as const;

export default function Create() {
  const { session } = useStore();
  const router = useRouter();
  const publish = usePublishPost();
  const { toast } = useFeedback();
  const [image, setImage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [tone, setTone] = useState<(typeof TONE_KEYS)[number]>("mint");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      setImage(await compressImage(file));
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = publish({ caption, tags, tone, image });
    if (errs) return setErrors(errs);
    toast("Your post is live!");
    router.push("/home");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form onSubmit={submit} className="card p-5" noValidate>
        <h1 className="text-[clamp(2.4rem,6vw,3.5rem)] leading-[0.9]">New post</h1>
        {image ? (
          <div className="relative mb-4 overflow-hidden rounded-xl ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Photo preview" className="aspect-[4/3] w-full object-cover" />
            <button type="button" onClick={() => setImage(undefined)} className="absolute right-2 top-2 inline-flex h-9 items-center gap-1 rounded-full bg-ink/80 px-3 text-xs font-semibold text-white hover:bg-ink">
              <X className="h-4 w-4" /> Remove photo
            </button>
          </div>
        ) : (
          <div className={`mb-4 grid aspect-[4/3] place-items-center rounded-xl bg-gradient-to-br px-6 text-center ${TONES[tone].bg}`}>
            <p className="text-lg font-semibold text-ink/80">{caption || "Your post preview"}</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="sr-only" tabIndex={-1} aria-hidden="true" />
        <Button type="button" variant="secondary" className="mb-4 w-full" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />} {image ? "Change photo" : "Add a photo"}
        </Button>
        {!image && <p className="mb-2 text-[13px] font-medium">Background colour</p>}
        <div className={`mb-4 flex gap-2 ${image ? "hidden" : ""}`} role="radiogroup" aria-label="Background">
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
          <Field label="Tags" optional>
            <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>Share post</Button>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted">Other things you can create</p>
        {session?.role === "business" && (
          <Link href="/affiliates/new" className="card lift flex items-center gap-3 p-4 hover:border-ink">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><Link2 className="h-5 w-5" /></span>
            <span className="flex-1 text-sm font-semibold">Affiliate program</span>
            <ChevronRight className="h-4 w-4 text-muted" />
          </Link>
        )}
        <Link href="/money?add=1" className="card lift flex items-center gap-3 p-4 hover:border-ink">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Wallet className="h-5 w-5" /></span>
          <span className="flex-1 text-sm font-semibold">{session?.role === "business" ? "Spending record" : "Income record"}</span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      </div>
    </div>
  );
}
