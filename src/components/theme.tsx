"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/** Two themes only: White and Black (true black, made for OLED phones). */
export type ThemeChoice = "light" | "dark";
const KEY = "mm.theme";

/** Runs before first paint (inlined in <head>) so there is no flash. First visit follows the device. */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${KEY}");var d=c?c==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;

function apply(choice: ThemeChoice) {
  document.documentElement.dataset.theme = choice;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", choice === "dark" ? "#000000" : "#ffffff");
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("light");

  useEffect(() => {
    setChoice(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  function set(next: ThemeChoice) {
    setChoice(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked: applies for this visit only */
    }
    apply(next);
  }

  return { choice, dark: choice === "dark", set };
}

/** Black / White switch. */
export function ThemeToggle({ withLabel = false, className = "" }: { withLabel?: boolean; className?: string }) {
  const { dark, set } = useTheme();
  const label = dark ? "Switch to white theme" : "Switch to black theme";
  if (!withLabel) {
    return (
      <button type="button" onClick={() => set(dark ? "light" : "dark")} aria-label={label} title={label} className={`press grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-canvas ${className}`}>
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    );
  }
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label="Black theme" onClick={() => set(dark ? "light" : "dark")} className={`press flex h-11 items-center gap-3 rounded-full px-3 text-[15px] text-ink hover:bg-canvas ${className}`}>
      {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="flex-1 text-left">{dark ? "Black theme" : "White theme"}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-aurora" : "bg-line"}`} aria-hidden="true">
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-300 ${dark ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

/** Two-way picker used in Settings. */
export function ThemePicker() {
  const { choice, set } = useTheme();
  const opts = [
    { id: "light", label: "White", swatch: "bg-white ring-1 ring-black/10" },
    { id: "dark", label: "Black", swatch: "bg-black ring-1 ring-white/20" },
  ] as const;
  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-2">
      {opts.map(({ id, label, swatch }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={choice === id}
          onClick={() => set(id)}
          className={`press flex items-center gap-3 rounded-2xl border p-3 text-[14px] font-semibold ${choice === id ? "border-brand-400 bg-brand-50 text-brand-700 ring-4 ring-brand-100" : "border-line hover:bg-canvas"}`}
        >
          <span className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl ${swatch}`}>
            <span className="bg-aurora h-3 w-3 rounded-full" />
          </span>
          {label}
        </button>
      ))}
    </div>
  );
}
