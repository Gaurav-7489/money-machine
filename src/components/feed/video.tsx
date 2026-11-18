"use client";

import { VideoOff } from "lucide-react";
import { useMediaUrl } from "@/lib/media";

export function VideoView({ id }: { id: string }) {
  const { url, missing } = useMediaUrl(id);
  if (missing)
    return (
      <div className="grid aspect-video w-full place-items-center rounded-2xl bg-elevated text-sm text-muted ring-1 ring-line">
        <span className="flex items-center gap-2"><VideoOff className="h-4 w-4" /> Video saved on another device</span>
      </div>
    );
  if (!url) return <div className="skeleton aspect-video w-full rounded-2xl" />;
  return <video src={url} controls playsInline preload="metadata" className="max-h-[520px] w-full rounded-2xl bg-black" />;
}
