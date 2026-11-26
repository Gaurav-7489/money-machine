"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Field, PageHeader, inputCls } from "@/components/ui";
import { ImageSlot } from "@/components/image-slot";
import { DEFAULT_CURRENCY, currencySymbol, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import { affiliateProgramInput, fieldErrors, type FieldErrors } from "@/lib/validation";

export default function NewProgram() {
  const { session, update } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", perSaleMin: "", perSaleMax: "", description: "", terms: "" });
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
      programs: [{ id: uid("prog"), ...parsed.data, currency: session!.currency ?? DEFAULT_CURRENCY, brand: session!.displayName, ownerHandle: session!.handle, status, imageId, createdAt: new Date().toISOString() }, ...s.programs],
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
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Price per sale ({currencySymbol(session.currency)}), min to max</p>
          <div className="grid grid-cols-2 gap-2">
            <label><span className="sr-only">Lowest price per sale</span><input className={inputCls} inputMode="numeric" placeholder="Min e.g. 100" value={form.perSaleMin} onChange={(e) => setForm((f) => ({ ...f, perSaleMin: e.target.value.replace(/[^\d]/g, "") }))} aria-invalid={!!errors.perSaleMin} /></label>
            <label><span className="sr-only">Highest price per sale</span><input className={inputCls} inputMode="numeric" placeholder="Max e.g. 250" value={form.perSaleMax} onChange={(e) => setForm((f) => ({ ...f, perSaleMax: e.target.value.replace(/[^\d]/g, "") }))} aria-invalid={!!errors.perSaleMax} /></label>
          </div>
          {(errors.perSaleMin || errors.perSaleMax) && <p role="alert" className="mt-1 text-[12px] text-danger">{errors.perSaleMin || errors.perSaleMax}</p>}
        </div>
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
