"use client";

import { MotionConfig, motion } from "motion/react";
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
    <motion.span layoutId={`tab-${group}`} className={`absolute inset-0 -z-10 rounded-[inherit] bg-ink ${className}`} aria-hidden="true" />
  ) : (
    <motion.span layoutId={`tab-${group}`} className={`bg-action absolute inset-x-4 -bottom-px h-[3px] rounded-full ${className}`} aria-hidden="true" />
  );
}
