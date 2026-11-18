"use client";

import { useEffect, useRef } from "react";

/**
 * The app-wide backdrop: four soft colour fields drifting slowly, plus a few
 * fine wave lines flowing along the bottom. Pure CSS/SVG (no WebGL), GPU
 * transforms only, paused when the tab is hidden and frozen under
 * prefers-reduced-motion. Colours come from the theme tokens.
 */
export function Ambient() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onVis = () => el.style.setProperty("--play", document.hidden ? "paused" : "running");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return (
    <div ref={ref} className="ambient [&_*]:[animation-play-state:var(--play,running)]" aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <span className="blob b4" />
      <Waves className="absolute -bottom-6 left-0 h-40 w-[200%] opacity-80 md:h-56" />
    </div>
  );
}

/** Fine flowing lines. Twice as wide as the viewport and translated -50% in a loop, so it's seamless. */
export function Waves({ className = "", lines = 5 }: { className?: string; lines?: number }) {
  const paths = Array.from({ length: lines }, (_, i) => {
    const y = 40 + i * 14;
    const a = 18 + i * 4;
    return `M0 ${y} C 150 ${y - a}, 350 ${y + a}, 500 ${y} S 850 ${y - a}, 1000 ${y} S 1350 ${y + a}, 1500 ${y} S 1850 ${y - a}, 2000 ${y}`;
  });
  return (
    <svg viewBox="0 0 2000 140" preserveAspectRatio="none" className={`wave-flow ${className}`}>
      {paths.map((d, i) => <path key={i} d={d} className="wave-line" />)}
    </svg>
  );
}

/** A filled wave used to divide sections (e.g. on the landing page). */
export function WaveDivider({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={`block w-full ${flip ? "rotate-180" : ""} ${className}`} aria-hidden="true">
      <path d="M0 64 C 240 120, 480 0, 720 48 S 1200 112, 1440 40 V120 H0 Z" fill="currentColor" />
    </svg>
  );
}
