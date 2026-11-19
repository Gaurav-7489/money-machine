"use client";

/**
 * App-wide feedback: toast notifications and a friendly confirm dialog.
 * Mounted once in the root layout so toasts survive page changes
 * (e.g. "Your post is live!" after publishing and returning to the feed).
 */
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** red confirm button for destructive actions */
  danger?: boolean;
}

interface FeedbackApi {
  toast: (message: string, kind?: ToastKind) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const Ctx = createContext<FeedbackApi | null>(null);

const ICON = { success: CheckCircle2, error: XCircle, info: Info };
const TONE = {
  success: "bg-ink text-surface",
  error: "bg-danger text-on-danger",
  info: "bg-ink text-surface",
};

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "success") => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === "error" ? 5000 : 3200);
    },
    [dismiss],
  );

  const confirm = useCallback((opts: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })), []);

  const api = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8">
        {toasts.map((t) => {
          const Icon = ICON[t.kind];
          return (
            <div
              key={t.id}
              role={t.kind === "error" ? "alert" : "status"}
              className={`animate-fade-up pointer-events-auto flex max-w-md items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${TONE[t.kind]}`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${t.kind === "success" ? "text-brand-300" : ""}`} />
              <span>{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="-mr-1 ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full opacity-70 hover:opacity-100" aria-label="Close message">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      <ConfirmDialog
        opts={pending}
        onDone={(v) => {
          pending?.resolve(v);
          setPending(null);
        }}
      />
    </Ctx.Provider>
  );
}

function ConfirmDialog({ opts, onDone }: { opts: ConfirmOptions | null; onDone: (v: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (opts && !d.open) d.showModal();
    if (!opts && d.open) d.close();
  }, [opts]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onDone(false);
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-xl bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      {opts && (
        <div className="p-6 text-center">
          <span className={`mx-auto grid h-12 w-12 place-items-center rounded-xl ${opts.danger ? "bg-rose-50 text-danger" : "bg-brand-50 text-brand-700"}`}>
            {opts.danger ? <AlertTriangle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
          </span>
          <h2 id="confirm-title" className="font-text mt-3 text-lg font-bold">{opts.title}</h2>
          {opts.body && <p className="mt-1 text-sm text-muted">{opts.body}</p>}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
            <button onClick={() => onDone(false)} className="press h-11 flex-1 rounded-full border border-line bg-surface text-sm font-semibold hover:bg-elevated">
              {opts.cancelLabel ?? "Cancel"}
            </button>
            <button
              autoFocus
              onClick={() => onDone(true)}
              className={`press h-11 flex-1 rounded-full text-sm font-semibold ${opts.danger ? "bg-danger text-on-danger hover:brightness-110" : "bg-aurora text-on-accent btn-glow"}`}
            >
              {opts.confirmLabel ?? "Yes, continue"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

export function useFeedback(): FeedbackApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return v;
}
