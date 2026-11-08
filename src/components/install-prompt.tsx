"use client";

import { Download, Share, SquarePlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LogoMark } from "./logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

const DISMISS_KEY = "mm.install.dismissed";

export function useInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    return outcome === "accepted";
  }, [deferred]);

  return { platform, installed, canPrompt: !!deferred, install };
}

/** Platform-appropriate instructions + native prompt where the browser supports it. */
export function InstallGuide() {
  const { platform, installed, canPrompt, install } = useInstall();

  if (installed) {
    return <p className="text-sm text-muted">Money Machine is installed on this device. Open it from your home screen.</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      {canPrompt && (
        <button onClick={install} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-600 font-semibold text-white hover:bg-brand-700">
          <Download className="h-4 w-4" /> Add to Home Screen
        </button>
      )}
      {platform === "ios" && (
        <ol className="space-y-2">
          <li className="flex items-center gap-2"><Share className="h-4 w-4 text-brand-600" /> In Safari, tap <b>Share</b> in the toolbar.</li>
          <li className="flex items-center gap-2"><SquarePlus className="h-4 w-4 text-brand-600" /> Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li>
        </ol>
      )}
      {platform === "android" && !canPrompt && (
        <p>Open the browser menu <b>⋮</b> and choose <b>Install app</b> or <b>Add to Home screen</b>.</p>
      )}
      {platform === "desktop" && !canPrompt && (
        <p>In Chrome or Edge, use the install icon in the address bar, or open the menu and choose <b>Install Money Machine</b>.</p>
      )}
    </div>
  );
}

/** Small dismissible banner shown on phones/tablets until installed. */
export function InstallBanner() {
  const { platform, installed, canPrompt, install } = useInstall();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  if (installed || hidden || platform === "desktop") return null;
  if (platform === "android" && !canPrompt) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-3 md:mx-6">
      <LogoMark className="h-8 w-8 shrink-0" />
      <div className="min-w-0 flex-1 text-[13px] leading-tight">
        <p className="font-semibold">Add Money Machine to your Home Screen</p>
        <p className="text-muted">{platform === "ios" ? "Tap Share, then “Add to Home Screen”." : "Use it like an app — full screen, one tap away."}</p>
      </div>
      {canPrompt && (
        <button onClick={install} className="h-8 rounded-full bg-brand-600 px-3 text-xs font-semibold text-white">
          Install
        </button>
      )}
      <button onClick={dismiss} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
