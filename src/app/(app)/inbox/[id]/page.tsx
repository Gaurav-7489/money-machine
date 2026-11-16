"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { ArchiveRestore, CheckCheck, MessageCircleOff, SendHorizontal, Star, Trash2 } from "lucide-react";
import { Avatar } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { ButtonLink, DeviceNote, EmptyState, PageHeader, SampleTag } from "@/components/ui";
import { timeAgo, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

const MAX = 2000;

export default function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { all } = useThreads();
  const thread = all.find((t) => t.id === id);
  const { messages, update, readThreads, toggle } = useStore();
  const { toast, confirm } = useFeedback();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mine = messages.filter((m) => m.threadId === id);

  useEffect(() => {
    if (thread && !readThreads.includes(id)) update((s) => ({ ...s, readThreads: [...s.readThreads, id] }));
  }, [id, thread, readThreads, update]);

  useEffect(() => {
    // braces matter: scrollIntoView can return a Promise, which React would treat as a cleanup function
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [mine.length]);

  if (!thread) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Conversation" back="/inbox" />
        <div className="card">
          <EmptyState
            icon={<MessageCircleOff className="h-5 w-5" />}
            title="We couldn't find this conversation"
            body="It may have been deleted. Go back to your messages to start a new one."
            action={<ButtonLink href="/inbox" variant="soft">Back to Messages</ButtonLink>}
          />
        </div>
      </div>
    );
  }
  const p = thread.profile;

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = body.trim();
    if (!text) {
      setError("Type a message first.");
      inputRef.current?.focus();
      return;
    }
    if (text.length > MAX) {
      setError(`Messages can be up to ${MAX} characters. Yours has ${text.length}.`);
      return;
    }
    update((s) => ({
      ...s,
      messages: [...s.messages, { id: uid("msg"), threadId: id, fromMe: true, body: text, createdAt: new Date().toISOString() }],
      trashedThreads: s.trashedThreads.filter((x) => x !== id),
    }));
    setBody("");
    setError("");
    inputRef.current?.focus();
  }

  async function trash() {
    if (thread!.trashed) {
      toggle("trashedThreads", id);
      toast("Conversation restored to Inbox");
      return;
    }
    if (!(await confirm({ title: "Move this conversation to Trash?", body: "You can restore it from Trash later.", confirmLabel: "Move to Trash", danger: true }))) return;
    toggle("trashedThreads", id);
    toast("Moved to Trash", "info");
  }

  function star() {
    toggle("starredThreads", id);
    toast(thread!.starred ? "Removed from Starred" : "Starred! Find it in the Starred folder.", thread!.starred ? "info" : "success");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <PageHeader
        title={p.name}
        back="/inbox"
        action={
          <div className="flex items-center gap-1">
            {thread.sample && <SampleTag className="mr-1" />}
            <button onClick={star} aria-pressed={thread.starred} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label={thread.starred ? "Remove star" : "Star this conversation"} title={thread.starred ? "Remove star" : "Star"}>
              <Star className={`h-5 w-5 ${thread.starred ? "animate-pop fill-amber-400 text-amber-400" : ""}`} />
            </button>
            <button onClick={trash} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label={thread.trashed ? "Restore from Trash" : "Move to Trash"} title={thread.trashed ? "Restore" : "Move to Trash"}>
              {thread.trashed ? <ArchiveRestore className="h-5 w-5 text-brand-700" /> : <Trash2 className="h-5 w-5" />}
            </button>
          </div>
        }
      />
      {thread.trashed && (
        <p className="mb-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-700 ring-1 ring-amber-200">
          This conversation is in Trash. Tap the restore button above to move it back.
        </p>
      )}
      <div className="card flex min-h-[60dvh] flex-col p-4">
        <Link href={`/u/${p.handle}`} className="group mb-4 flex flex-col items-center text-center">
          <Avatar name={p.name} tone={p.tone} size="lg" square={p.kind === "business"} />
          <p className="mt-2 text-sm font-semibold group-hover:underline">{p.name}</p>
          <p className="text-xs text-muted">@{p.handle} · {p.niche}</p>
          <span className="mt-1 text-xs font-semibold text-brand-700">View profile</span>
        </Link>
        <div className="flex-1 space-y-2" aria-live="polite">
          {thread.opener && (
            <>
              <p className="text-center text-[11px] text-muted">{timeAgo(thread.at)}</p>
              <div className="flex items-end gap-2">
                <Avatar name={p.name} tone={p.tone} size="xs" />
                <p className="max-w-[75%] rounded-2xl rounded-bl-md bg-canvas px-3.5 py-2 text-sm ring-1 ring-line">{thread.opener}</p>
              </div>
            </>
          )}
          {!thread.opener && mine.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">This is the start of your conversation with {p.name}. Say hello! 👋</p>
          )}
          {mine.map((m) => (
            <div key={m.id} className="animate-fade-up flex flex-col items-end">
              <p className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-sm text-white">{m.body}</p>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                <CheckCheck className="h-3.5 w-3.5 text-brand-600" /> Sent · {timeAgo(m.createdAt)}
              </span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="mt-4">
          <DeviceNote>Preview: your messages are saved on this device and are not delivered yet.</DeviceNote>
        </div>
        <form onSubmit={send} className="sticky bottom-20 mt-3 md:bottom-4" noValidate>
          <div className="flex items-end gap-2 rounded-3xl bg-surface">
            <label htmlFor="msg" className="sr-only">Write a message to {p.name}</label>
            <textarea
              ref={inputRef}
              id="msg"
              rows={1}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Write a message to ${p.name}…`}
              aria-invalid={!!error}
              aria-describedby={error ? "msg-err" : "msg-hint"}
              className="max-h-40 min-h-12 flex-1 resize-none rounded-3xl border border-line bg-surface px-4 py-3 text-[15px] outline-none [field-sizing:content] focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
            <button type="submit" className="press inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
              <SendHorizontal className="h-5 w-5" /> Send
            </button>
          </div>
          {error ? (
            <p id="msg-err" role="alert" className="mt-1 px-2 text-[12px] text-rose-600">{error}</p>
          ) : (
            <p id="msg-hint" className="mt-1 hidden px-2 text-[11px] text-muted md:block">Press Enter to send, Shift + Enter for a new line.</p>
          )}
        </form>
      </div>
    </div>
  );
}
