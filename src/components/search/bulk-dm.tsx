"use client";

import { useState } from "react";
import { CalendarClock, Pencil, Send, Users } from "lucide-react";
import { Avatar } from "@/components/art";
import { DealFields, DealSummary, checkDeal, emptyDeal, type DealDraft } from "@/components/deal-form";
import { useFeedback } from "@/components/feedback";
import { Button, Sheet } from "@/components/ui";
import { BULK_DM_COOLDOWN_DAYS } from "@/lib/catalog";
import type { Profile } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";
import type { DealOffer } from "@/lib/types";

/**
 * Bulk DM: one deal offer to everyone selected in Search.
 * Step 1: type, budget range, deliverables and a note. Step 2: review, with
 * "Change" to go back, then Send or Cancel. Allowed once every 10 days.
 */
export function BulkDm({ open, onClose, recipients, onSent }: { open: boolean; onClose: () => void; recipients: Profile[]; onSent: () => void }) {
  const { session } = useStore();
  const { sendBulk, bulkDaysLeft } = useThreads();
  const { toast } = useFeedback();
  const [draft, setDraft] = useState<DealDraft>(() => emptyDeal(session?.role === "creator" ? "partnership" : "brand_deal"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [review, setReview] = useState<DealOffer | null>(null);

  function close() {
    setReview(null);
    setErrors({});
    onClose();
  }

  function next(e: React.FormEvent) {
    e.preventDefault();
    const r = checkDeal(draft, { currency: session?.currency });
    setErrors(r.errors);
    if (r.offer) setReview(r.offer);
  }

  function send() {
    if (!review) return;
    if (!sendBulk(recipients.map((p) => p.handle), review)) {
      toast(`You can send one bulk DM every ${BULK_DM_COOLDOWN_DAYS} days.`, "error");
      return;
    }
    toast(`Bulk DM sent to ${recipients.length} ${recipients.length === 1 ? "person" : "people"}! 🚀`);
    setDraft(emptyDeal(draft.type));
    setReview(null);
    onSent();
    onClose();
  }

  return (
    <Sheet open={open} onClose={close} title={review ? "Review bulk DM" : "Bulk DM"}>
      {bulkDaysLeft > 0 ? (
        <div className="py-6 text-center">
          <span className="bg-aurora-soft mx-auto grid h-14 w-14 place-items-center rounded-xl text-brand-600"><CalendarClock className="h-7 w-7" /></span>
          <p className="mt-3 font-bold">Your next bulk DM unlocks in {bulkDaysLeft} {bulkDaysLeft === 1 ? "day" : "days"}</p>
          <Button variant="secondary" className="mt-4" onClick={close}>Got it</Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-elevated p-3">
            <div className="flex -space-x-2">
              {recipients.slice(0, 4).map((p) => (
                <span key={p.handle} className="rounded-full ring-2 ring-surface"><Avatar name={p.name} tone={p.tone} size="sm" square={p.kind === "business"} /></span>
              ))}
            </div>
            <p className="min-w-0 flex-1 text-sm">
              <span className="flex items-center gap-1 font-semibold"><Users className="h-4 w-4" /> {recipients.length} {recipients.length === 1 ? "recipient" : "recipients"}</span>
              <span className="block truncate text-xs text-muted">{recipients.map((p) => p.name).join(", ")}</span>
            </p>
          </div>

          {review ? (
            <div className="space-y-4">
              <DealSummary deal={review} />
              <div className="grid grid-cols-3 gap-2">
                <Button variant="secondary" onClick={() => setReview(null)}><Pencil className="h-4 w-4" /> Change</Button>
                <Button variant="ghost" onClick={close}>Cancel</Button>
                <Button onClick={send}><Send className="h-4 w-4" /> Send</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={next} noValidate className="space-y-5">
              <DealFields draft={draft} onChange={setDraft} errors={errors} currency={session?.currency} />
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-700 ring-1 ring-amber-200">You can send one bulk DM every {BULK_DM_COOLDOWN_DAYS} days, so make it count.</p>
              <div className="sticky bottom-0 -mx-5 grid grid-cols-2 gap-2 border-t border-line bg-surface px-5 py-3">
                <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
                <Button type="submit">Review</Button>
              </div>
            </form>
          )}
        </>
      )}
    </Sheet>
  );
}
