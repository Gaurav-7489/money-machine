"use client";

import { use, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import { Avatar } from "@/components/art";
import { DeviceNote, PageHeader, SampleTag } from "@/components/ui";
import { timeAgo, uid } from "@/lib/format";
import { SAMPLE_THREADS, profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";

export default function Thread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const thread = SAMPLE_THREADS.find((t) => t.id === id);
  const { messages, update, readThreads } = useStore();
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const mine = messages.filter((m) => m.threadId === id);

  useEffect(() => {
    if (thread && !readThreads.includes(id)) update((s) => ({ ...s, readThreads: [...s.readThreads, id] }));
  }, [id, thread, readThreads, update]);

  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [mine.length]);

  if (!thread) notFound();
  const p = profileByHandle(thread.with)!;

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    update((s) => ({ ...s, messages: [...s.messages, { id: uid("msg"), threadId: id, fromMe: true, body: text.slice(0, 2000), createdAt: new Date().toISOString() }] }));
    setBody("");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <PageHeader
        title={p.name}
        back="/inbox"
        action={<SampleTag />}
      />
      <div className="card flex min-h-[55dvh] flex-col p-4">
        <div className="mb-4 flex flex-col items-center text-center">
          <Avatar name={p.name} tone={p.tone} size="lg" square={p.kind === "business"} />
          <p className="mt-2 text-sm font-semibold">{p.name}</p>
          <p className="text-xs text-muted">{p.niche}</p>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-end gap-2">
            <Avatar name={p.name} tone={p.tone} size="xs" />
            <p className="max-w-[75%] rounded-2xl rounded-bl-md bg-canvas px-3.5 py-2 text-sm">{thread.preview}</p>
          </div>
          <p className="text-center text-[11px] text-muted">{timeAgo(thread.at)}</p>
          {mine.map((m) => (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[75%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-sm text-white">{m.body}</p>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="mt-4">
          <DeviceNote>Preview: your messages are saved on this device and are not delivered yet.</DeviceNote>
        </div>
        <form onSubmit={send} className="mt-3 flex items-center gap-2">
          <label htmlFor="msg" className="sr-only">Message</label>
          <input
            id="msg"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message…"
            className="h-11 flex-1 rounded-full border border-line bg-white px-4 text-[15px] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          <button type="submit" disabled={!body.trim()} className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white disabled:opacity-40" aria-label="Send">
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
