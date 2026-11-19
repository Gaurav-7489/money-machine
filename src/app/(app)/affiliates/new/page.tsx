"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Field, PageHeader, inputCls } from "@/components/ui";
import { ImageSlot } from "@/components/image-slot";
import { uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import { affiliateProgramInput, fieldErrors, type FieldErrors } from "@/lib/validation";

export default function NewProgram() {
  const { session, update } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", commissionPercent: "10", description: "", terms: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [imageId, setImageId] = useState<string | undefined>();

  useEffect(() => {
    if (session && session.role !== "business") router.replace("/affiliates");
  }, [session, router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent, status: "active" | "draft") {
    e.preventDefault();
    const parsed = affiliateProgramInput.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    update((s) => ({
      ...s,
      programs: [{ id: uid("prog"), ...parsed.data, brand: session!.displayName, ownerHandle: session!.handle, status, imageId, createdAt: new Date().toISOString() }, ...s.programs],
    }));
    router.push("/affiliates");
  }

  if (session?.role !== "business") return null;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Create Program" back="/affiliates" />
      <form onSubmit={(e) => submit(e, "active")} className="space-y-5" noValidate>
        <ImageSlot label="Program image (optional)" id={imageId} onChange={setImageId} aspect="aspect-square" />
        <Field label="Program name" error={errors.name}>
          <input className={inputCls} value={form.name} onChange={set("name")} aria-invalid={!!errors.name} placeholder={`${session.displayName} Affiliate`} />
        </Field>
        <Field label="Commission (%)" error={errors.commissionPercent}>
          <input className={inputCls} inputMode="decimal" value={form.commissionPercent} onChange={set("commissionPercent")} aria-invalid={!!errors.commissionPercent} />
        </Field>
        <Field label="Description" error={errors.description}>
          <textarea className={`${inputCls} min-h-20`} value={form.description} onChange={set("description")} aria-invalid={!!errors.description} />
        </Field>
        <Field label="Terms" error={errors.terms}>
          <textarea className={`${inputCls} min-h-28`} value={form.terms} onChange={set("terms")} aria-invalid={!!errors.terms} />
        </Field>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={(e) => submit(e, "draft")}>Save draft</Button>
          <Button type="submit" className="flex-1">Publish</Button>
        </div>
      </form>
    </div>
  );
}
