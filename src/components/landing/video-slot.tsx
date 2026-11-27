"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Plays the video for one side. Drop the file in public/videos (creator.mp4 /
 * business.mp4); until it exists, a placeholder shows in its place.
 */
export function VideoSlot({ src, label }: { src: string; label: string }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
      {missing ? (
        <div className="grid aspect-video place-items-center bg-gradient-to-br from-brand-50 via-aqua/10 to-lime/20 text-center dark:bg-elevated dark:bg-none">
          <div>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white dark:bg-primary dark:text-on-primary">
              <Play className="h-6 w-6 translate-x-0.5" />
            </span>
            <p className="mt-3 text-sm font-semibold">Video coming soon</p>
            <p className="mt-0.5 text-[13px] text-muted">{label}</p>
          </div>
        </div>
      ) : (
        <video className="aspect-video w-full bg-black" controls playsInline preload="metadata" src={src} aria-label={label} onError={() => setMissing(true)} />
      )}
    </div>
  );
}
