"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
const KEY = "mm.theme";

/** Runs before first paint (inlined in <head>) so there is no light flash in dark mode. */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${KEY}")||"system";var d=c==="dark"||(c==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let saved: ThemeChoice = "system";
    try {
      saved = (localStorage.getItem(KEY) as ThemeChoice) || "system";
    } catch {
      /* storage blocked */
    }
    setChoice(saved);
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      apply("system");
      setDark(mq.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  function set(next: ThemeChoice) {
    setChoice(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked: applies for this visit only */
    }
    apply(next);
    setDark(document.documentElement.dataset.theme === "dark");
  }

  return { choice, dark, set };
}

/** Compact sun/moon switch with a text label. */
export function ThemeToggle({ withLabel = false, className = "" }: { withLabel?: boolean; className?: string }) {
  const { dark, set } = useTheme();
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={() => set(dark ? "light" : "dark")}
      aria-label={withLabel ? undefined : label}
      title={label}
      className={`press inline-flex items-center gap-3 rounded-full text-ink hover:bg-canvas ${withLabel ? "h-11 px-3 text-[15px]" : "grid h-10 w-10 place-items-center"} ${className}`}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {withLabel && <span>{dark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}

/** Three-way picker used in Settings. */
export function ThemePicker() {
  const { choice, set } = useTheme();
  const opts = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "Same as device", icon: Monitor },
  ] as const;
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-2">
      {opts.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={choice === id}
          onClick={() => set(id)}
          className={`press flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-[13px] font-medium ${choice === id ? "border-brand-400 bg-brand-50 text-brand-700 ring-4 ring-brand-100" : "border-line hover:bg-canvas"}`}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </div>
  );
}
