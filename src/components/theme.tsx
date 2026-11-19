"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark";
const KEY = "mm.theme";
const EVENT = "mm-theme";

/** Runs before first paint (inlined in <head>) so there is no flash. First visit follows the device. */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${KEY}");var d=c?c==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}document.addEventListener("DOMContentLoaded",function(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(document.documentElement).getPropertyValue("--color-canvas").trim();},{once:true});})();`;

function apply(choice: ThemeChoice) {
  document.documentElement.dataset.theme = choice;
  const tint = getComputedStyle(document.documentElement).getPropertyValue("--color-canvas").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", tint);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: choice }));
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

  function set(next: ThemeChoice) {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked: applies for this visit only */
    }
    apply(next);
  }

  return { choice, dark: choice === "dark", set };
}

/** Light / dark switch. */
export function ThemeToggle({ withLabel = false, className = "" }: { withLabel?: boolean; className?: string }) {
  const { dark, set } = useTheme();
  const label = dark ? "Switch to white theme" : "Switch to dark theme";
  if (!withLabel) {
    return (
      <button type="button" onClick={() => set(dark ? "light" : "dark")} aria-label={label} title={label} className={`press grid h-10 w-10 place-items-center rounded-control text-ink hover:bg-elevated ${className}`}>
        <span key={String(dark)} className="animate-[scale-in_0.4s_var(--ease-spring)]">{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</span>
      </button>
    );
  }
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="Dark theme" onClick={() => set(dark ? "light" : "dark")} className={`press flex h-11 items-center gap-3 rounded-control px-3 text-[15px] text-ink hover:bg-elevated ${className}`}>
      {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="flex-1 text-left">{dark ? "Dark theme" : "White theme"}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-action" : "bg-line"}`} aria-hidden="true">
        <span className="absolute top-0.5 h-5 w-5 rounded-full left-0.5 bg-on-accent shadow transition-transform duration-200" style={{ transform: dark ? "translateX(1.25rem)" : undefined }} />
      </span>
    </button>
  );
}

/** Two-way picker used in Settings. */
export function ThemePicker() {
  const { choice, set } = useTheme();
  const opts = [
    { id: "light", label: "White", sub: "Warm white" },
    { id: "dark", label: "Dark", sub: "Warm charcoal" },
  ] as const;
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2">
      {opts.map(({ id, label, sub }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={choice === id}
          onClick={() => set(id)}
          className={`press flex items-center gap-3 rounded-control border p-3 text-left ${choice === id ? "border-brand-400 bg-brand-50 ring-4 ring-brand-100" : "border-line hover:bg-elevated"}`}
        >
          <span aria-hidden="true" className="theme-swatch" data-swatch={id}>
            <span />
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
