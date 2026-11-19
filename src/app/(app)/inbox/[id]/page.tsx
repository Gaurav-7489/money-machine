"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { ArchiveRestore, Check, CheckCheck, Handshake, MessageCircleOff, Pin, SendHorizontal, Star, Sticker, Trash2, X } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { DealFields, DealSummary, checkDeal, emptyDeal, type DealDraft } from "@/components/deal-form";
import { GifPicker, GifView } from "@/components/feed/gifs";
import { useFeedback } from "@/components/feedback";
import { Button, ButtonLink, EmptyState, PageHeader, SampleTag, Sheet } from "@/components/ui";
import { earningShort } from "@/lib/catalog";
import { timeAgo } from "@/lib/format";
import { profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads, type ViewMessage } from "@/lib/threads";
import type { DealOffer } from "@/lib/types";

const MAX = 2000;

function MatchesCard({ handles }: { handles: string[] }) {
  const { startThread, send, all } = useThreads();
  const { session } = useStore();
  const router = useRouter();
  if (!handles.length) return null;
  return (
    <ul className="mt-2 space-y-2">
      {handles.map((h) => {
        const p = profileByHandle(h);
        if (!p) return null;
        const already = all.some((t) => t.profile.handle === h && t.sentByMe);
        return (
          <li key={h} className="flex items-center gap-3 rounded-xl bg-surface p-2.5 ring-1 ring-line">
            <Link href={`/u/${h}`} className="flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar name={p.name} tone={p.tone} square={p.kind === "business"} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{p.name}</span>
                <span className="block truncate text-xs text-muted">{p.niches.join(" · ")}</span>
              </span>
            </Link>
            <button
              disabled={already}
              onClick={() => {
                const id = startThread(h);
                send(id, { body: `Hi ${p.name}! Money Machine matched us, I'd love to work together. ${session?.role === "creator" ? "Here's my profile." : "Are you open to a collab?"} 👋` });
                router.push(`/inbox/${id}`);
              }}
              className="press inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-aurora px-3 text-[12px] font-bold text-on-accent disabled:bg-none disabled:bg-elevated disabled:text-muted"
            >
              {already ? <><Check className="h-3.5 w-3.5" /> Sent</> : "Say hi 👋"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Bubble({ m, name, tone, square, onReply }: { m: ViewMessage; name: string; tone: Parameters<typeof Avatar>[0]["tone"]; square: boolean; onReply: (kind: "accept" | "counter" | "decline", deal: DealOffer) => void }) {
  if (m.fromMe)
    return (
      <div className="animate-fade-up flex flex-col items-end">
        {m.deal && <div className="mb-1 w-[85%] max-w-sm"><DealSummary deal={{ ...m.deal, note: "" }} compact /></div>}
        {m.gif && <div className="mb-1"><GifView id={m.gif} size="md" /></div>}
        {m.body && <p className="bg-aurora max-w-[80%] whitespace-pre-wrap break-words rounded-[18px] rounded-br-[6px] px-4 py-2.5 text-[15px] text-on-accent">{m.body}</p>}
        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><CheckCheck className="h-3.5 w-3.5 text-gain" /> Sent · {timeAgo(m.at)}</span>
      </div>
    );
  return (
    <div className="flex items-end gap-2">
      <Avatar name={name} tone={tone} size="xs" square={square} />
      <div className="max-w-[85%]">
        {m.body && <p className="whitespace-pre-wrap break-words rounded-[18px] rounded-bl-[6px] border border-line bg-surface px-4 py-2.5 text-[15px]">{m.body}</p>}
        {m.matches && <MatchesCard handles={m.matches} />}
        {m.deal && (
          <div className="mt-1.5 w-[min(22rem,80vw)]">
            <DealSummary deal={m.deal} />
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              <button onClick={() => onReply("accept", m.deal!)} className="press h-9 rounded-full bg-signal text-[12px] font-bold text-on-signal">Accept</button>
              <button onClick={() => onReply("counter", m.deal!)} className="press h-9 rounded-full border border-line bg-surface text-[12px] font-bold">Counter</button>
              <button onClick={() => onReply("decline", m.deal!)} className="press h-9 rounded-full border border-line bg-surface text-[12px] font-bold text-danger">Decline</button>
            </div>
          </div>
        )}
        <span className="mt-0.5 block text-[11px] text-muted">{timeAgo(m.at)}</span>
      </div>
    </div>
  );
}

export default function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { all, send, folders } = useThreads();
  const thread = all.find((t) => t.id === id);
  const { update, readThreads, toggle } = useStore();
  const { toast, confirm } = useFeedback();
  const [body, setBody] = useState("");
  const [gif, setGif] = useState<string | undefined>();
  const [gifOpen, setGifOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [deal, setDeal] = useState<DealDraft>(() => emptyDeal(thread?.dealType));
  const [dealErrors, setDealErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const count = thread?.messages.length ?? 0;

  useEffect(() => {
    if (thread && !readThreads.includes(id)) update((s) => ({ ...s, readThreads: [...s.readThreads, id] }));
  }, [id, thread, readThreads, update]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [count]);

  if (!thread) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Conversation" back="/inbox" />
        <div className="border-y border-line">
          <EmptyState icon={<MessageCircleOff className="h-5 w-5" />} title="We couldn't find this conversation" body="It may have been deleted. Go back to your messages to start a new one." action={<ButtonLink href="/inbox" variant="soft">Back to Messages</ButtonLink>} />
        </div>
      </div>
    );
  }
  const p = thread.profile;
  const folder = folders.find((f) => f.id === thread.folder);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = body.trim();
    if (!text && !gif) {
      setError("Type a message first.");
      inputRef.current?.focus();
      return;
    }
    if (text.length > MAX) return setError(`Messages can be up to ${MAX} characters. Yours has ${text.length}.`);
    send(id, { body: text, gif });
    setBody("");
    setGif(undefined);
    setError("");
    inputRef.current?.focus();
  }

  function sendOffer(e: React.FormEvent) {
    e.preventDefault();
    const r = checkDeal(deal);
    setDealErrors(r.errors);
    if (!r.offer) return;
    send(id, { body: r.offer.note, deal: r.offer });
    setOfferOpen(false);
    toast("Offer sent! 🤝");
  }

  function reply(kind: "accept" | "counter" | "decline", d: DealOffer) {
    if (kind === "accept") {
      send(id, { body: `I'm in! ✅ Happy to go ahead with the ${earningShort(d.type).toLowerCase()} offer. What are the next steps?`, gif: "deal" });
      toast("You accepted the offer 🎉");
    } else if (kind === "decline") {
      send(id, { body: "Thank you so much for thinking of me! This one isn't the right fit right now, but I'd love to stay in touch. 🙏" });
      toast("Declined politely", "info");
    } else {
      setDeal({ type: d.type, budgetMin: d.budgetMin?.toString() ?? "", budgetMax: d.budgetMax?.toString() ?? "", deliverables: d.deliverables.length ? d.deliverables : emptyDeal().deliverables, note: "" });
      setOfferOpen(true);
    }
  }

  async function trash() {
    if (thread!.trashed) {
      toggle("trashedThreads", id);
      toast("Conversation restored");
      return;
    }
    if (!(await confirm({ title: "Move this conversation to Trash?", body: "You can restore it from Trash later.", confirmLabel: "Move to Trash", danger: true }))) return;
    toggle("trashedThreads", id);
    toast("Moved to Trash", "info");
  }

  function star() {
    toggle("starredThreads", id);
    toast(thread!.starred ? "Removed from Starred" : "Starred! Find it in Starred.", thread!.starred ? "info" : "success");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <PageHeader
        title={p.name}
        back={`/inbox${folder ? `?folder=${encodeURIComponent(folder.id)}` : ""}`}
        action={
          <div className="flex items-center gap-1">
            {thread.sample && <SampleTag className="mr-1" />}
            <button onClick={star} aria-pressed={thread.starred} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-elevated" aria-label={thread.starred ? "Remove star" : "Star this conversation"} title={thread.starred ? "Remove star" : "Star"}>
              <Star className={`h-5 w-5 ${thread.starred ? "animate-pop fill-signal text-signal" : ""}`} />
            </button>
            {!thread.pinned && (
              <button onClick={trash} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-elevated" aria-label={thread.trashed ? "Restore from Trash" : "Move to Trash"} title={thread.trashed ? "Restore" : "Move to Trash"}>
                {thread.trashed ? <ArchiveRestore className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
              </button>
            )}
          </div>
        }
      />
      {thread.trashed && <p className="mb-3 border-l-2 border-signal py-1 pl-3 text-sm text-muted">This conversation is in Trash. Tap the restore button above to move it back.</p>}
      <div className="flex min-h-[60dvh] flex-col">
        <Link href={p.system ? "#" : `/u/${p.handle}`} className="group mb-4 flex flex-col items-center text-center">
          <Avatar name={p.name} tone={p.tone} size="lg" square={p.kind === "business"} ring={thread.pinned} />
          <p className="mt-2 flex items-center gap-1 text-sm font-semibold group-hover:underline">{p.name} {p.verified && <VerifiedMark />}</p>
          <p className="text-xs text-muted">@{p.handle} · {p.niche}</p>
          <span className="mt-1.5 flex flex-wrap justify-center gap-1">
            {folder && <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-muted">{thread.pinned && <Pin className="h-3 w-3" />}{folder.label} folder</span>}
          </span>
        </Link>
        <div className="flex-1 space-y-3" aria-live="polite">
          {thread.messages.map((m) => <Bubble key={m.id} m={m} name={p.name} tone={p.tone} square={p.kind === "business"} onReply={reply} />)}
          <div ref={endRef} />
        </div>
        <form onSubmit={submit} className="sticky bottom-20 mt-3 md:bottom-4" noValidate>
          {gif && (
            <div className="relative mb-2 inline-block">
              <GifView id={gif} size="sm" />
              <button type="button" onClick={() => setGif(undefined)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white" aria-label="Remove GIF"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <div className="flex items-end gap-1.5 rounded-[24px] border border-line bg-surface p-1 transition-colors focus-within:border-ink">
            {!p.system && (
              <button type="button" onClick={() => setOfferOpen(true)} className="press grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-elevated hover:text-ink" aria-label="Send a deal offer" title="Send a deal offer">
                <Handshake className="h-5 w-5" />
              </button>
            )}
            <button type="button" onClick={() => setGifOpen(true)} className="press grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-elevated hover:text-ink" aria-label="Add a GIF" title="GIF">
              <Sticker className="h-5 w-5" />
            </button>
            <label htmlFor="msg" className="sr-only">Write a message to {p.name}</label>
            <textarea
              ref={inputRef}
              id="msg"
              rows={1}
              value={body}
              onChange={(e) => { setBody(e.target.value); if (error) setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder="Message…"
              aria-invalid={!!error}
              aria-describedby={error ? "msg-err" : undefined}
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] outline-none [field-sizing:content]"
            />
            <button type="submit" className="press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal text-on-signal" aria-label="Send">
              <SendHorizontal className="h-5 w-5" />
            </button>
          </div>
          {error && <p id="msg-err" role="alert" className="mt-1 px-3 text-[12px] text-danger">{error}</p>}
        </form>
      </div>

      <GifPicker open={gifOpen} onClose={() => setGifOpen(false)} onPick={setGif} />
      <Sheet open={offerOpen} onClose={() => setOfferOpen(false)} title={`Deal offer to ${p.name}`}>
        <form onSubmit={sendOffer} noValidate className="space-y-5">
          <DealFields draft={deal} onChange={setDeal} errors={dealErrors} />
          <div className="sticky bottom-0 -mx-5 grid grid-cols-2 gap-2 border-t border-line bg-surface px-5 py-3">
            <Button type="button" variant="secondary" onClick={() => setOfferOpen(false)}>Cancel</Button>
            <Button type="submit"><Handshake className="h-4 w-4" /> Send offer</Button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}
