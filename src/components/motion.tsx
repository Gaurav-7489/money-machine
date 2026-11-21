"use client";

import { MotionConfig, motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode } from "react";

/** App-wide motion settings: honour the device's reduced-motion setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 420, damping: 36 }}>{children}</MotionConfig>;
}

/**
 * Animated tab underline / pill. Render it inside the active tab only; tabs
 * that share a `group` slide the indicator between them.
 */
export function TabIndicator({ group, variant = "line", className = "" }: { group: string; variant?: "line" | "pill"; className?: string }) {
  return variant === "pill" ? (
    <motion.span layoutId={`tab-${group}`} className={`absolute inset-0 -z-10 rounded-[inherit] bg-primary ${className}`} aria-hidden="true" />
  ) : (
    <motion.span layoutId={`tab-${group}`} className={`absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-brand-600 ${className}`} aria-hidden="true" />
  );
}

/** Desktop-only magnetic pull toward the pointer. Inert on touch screens. */
export function Magnetic({ children, strength = 0.25, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });
  return (
    <motion.span
      className={`inline-flex ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
