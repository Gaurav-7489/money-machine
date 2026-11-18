"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/** Two themes: White ("Creative Pastel") and Dark ("Editorial Neon"). */
export type ThemeChoice = "light" | "dark";
const KEY = "mm.theme";
const EVENT = "mm-theme";
const COLORS = { light: "#FAFAFD", dark: "#121212" };

/** Runs before first paint (inlined in <head>) so there is no flash. First visit follows the device. */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${KEY}");var d=c?c==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;

function apply(choice: ThemeChoice) {
  document.documentElement.dataset.theme = choice;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", COLORS[choice]));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: choice }));
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Switch theme with a circular reveal from the pointer (View Transitions), or a soft cross-fade. */
function transition(next: ThemeChoice, origin?: { x: number; y: number }) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (reduced()) return apply(next);
  if (doc.startViewTransition && origin) {
    const r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
    const vt = doc.startViewTransition(() => apply(next));
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${r}px at ${origin.x}px ${origin.y}px)`] },
          { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
    return;
  }
  const root = document.documentElement;
  root.classList.add("theme-fade");
  apply(next);
  setTimeout(() => root.classList.remove("theme-fade"), 400);
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("light");

  useEffect(() => {
    setChoice(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    const onTheme = (e: Event) => setChoice((e as CustomEvent<ThemeChoice>).detail);
    window.addEventListener(EVENT, onTheme);
    // Follow the device until the person picks a theme themselves.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      try {
        if (localStorage.getItem(KEY)) return;
      } catch {
        /* storage blocked */
      }
      apply(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onSystem);
    return () => {
      window.removeEventListener(EVENT, onTheme);
      mq.removeEventListener("change", onSystem);
    };
  }, []);

  function set(next: ThemeChoice, e?: { clientX: number; clientY: number }) {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked: applies for this visit only */
    }
    transition(next, e && e.clientX + e.clientY > 0 ? { x: e.clientX, y: e.clientY } : undefined);
  }

  return { choice, dark: choice === "dark", set };
}

/** Light / dark switch. */
export function ThemeToggle({ withLabel = false, className = "" }: { withLabel?: boolean; className?: string }) {
  const { dark, set } = useTheme();
  const label = dark ? "Switch to white theme" : "Switch to dark theme";
  if (!withLabel) {
    return (
      <button type="button" onClick={(e) => set(dark ? "light" : "dark", e)} aria-label={label} title={label} className={`press grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-elevated ${className}`}>
        <span key={String(dark)} className="animate-[scale-in_0.4s_var(--ease-spring)]">{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</span>
      </button>
    );
  }
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="Dark theme" onClick={(e) => set(dark ? "light" : "dark", e)} className={`press flex h-11 items-center gap-3 rounded-full px-3 text-[15px] text-ink hover:bg-elevated ${className}`}>
      {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="flex-1 text-left">{dark ? "Dark theme" : "White theme"}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-aurora" : "bg-line"}`} aria-hidden="true">
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-300" style={{ left: dark ? 22 : 2 }} />
      </span>
    </button>
  );
}

/** Two-way picker used in Settings. */
export function ThemePicker() {
  const { choice, set } = useTheme();
  const opts = [
    { id: "light", label: "White", sub: "Creative pastel", swatch: "bg-[#FAFAFD] ring-1 ring-black/10", dot: "linear-gradient(110deg,#8edbff,#b9a0ff,#ffb4d5,#ffd1ae)" },
    { id: "dark", label: "Dark", sub: "Charcoal, sharp", swatch: "bg-[#121212] ring-1 ring-white/15", dot: "linear-gradient(110deg,#ffffff,#9b9b9b)" },
  ] as const;
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2">
      {opts.map(({ id, label, sub, swatch, dot }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={choice === id}
          onClick={(e) => set(id, e)}
          className={`press flex items-center gap-3 rounded-2xl border p-3 text-left ${choice === id ? "border-brand-400 bg-brand-50 ring-4 ring-brand-100" : "border-line hover:bg-elevated"}`}
        >
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${swatch}`}>
            <span className="h-4 w-4 rounded-full" style={{ backgroundImage: dot }} />
          </span>
          <span>
            <span className="block text-[14px] font-semibold">{label}</span>
            <span className="block text-[11px] text-muted">{sub}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
