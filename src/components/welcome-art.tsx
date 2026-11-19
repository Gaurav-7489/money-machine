"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, CircleCheck, FileText, Search, Wallet } from "lucide-react";

export function WelcomeArt() {
  const stage = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stageElement = stage.current;
    const stackElement = stack.current;
    if (!stageElement || !stackElement) return;
    const canAnimate = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let dispose: (() => void) | undefined;
    let active = true;

    // Only load the 3D code on the first eligible mouse interaction.
    function activate(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !canAnimate.matches || !stageElement || !stackElement) return;
      stageElement.removeEventListener("pointermove", activate);
      void import("./welcome-depth").then(({ connectDepth }) => {
        if (active) dispose = connectDepth(stageElement, stackElement, canAnimate, event);
      }).catch(() => {
        // The CSS stack remains visible if the optional motion code fails to load.
      });
    }

    stageElement.addEventListener("pointermove", activate, { passive: true });
    return () => {
      active = false;
      stageElement.removeEventListener("pointermove", activate);
      dispose?.();
    };
  }, []);

  return (
    <figure className="landing-art">
      <div ref={stage} className="landing-stage">
        <div className="landing-stage-header">
          <span>Workspace preview</span>
          <span>Sample data</span>
        </div>
        <div ref={stack} className="landing-stack">
          <div className="landing-demo landing-demo-match">
            <span className="landing-demo-label"><Search size={15} aria-hidden="true" /> Creator match</span>
            <div className="landing-match-person">
              <span className="landing-initials" aria-hidden="true">MC</span>
              <span><strong>Maya Chen</strong><small>Skincare · UGC</small></span>
              <span className="landing-status">94% match</span>
            </div>
          </div>
          <div className="landing-demo landing-demo-offer">
            <span className="landing-demo-label"><FileText size={15} aria-hidden="true" /> Deal offer <ArrowUpRight className="ml-auto" size={15} aria-hidden="true" /></span>
            <strong>Product launch UGC</strong>
            <small>Studio North · 2 short videos</small>
            <span className="landing-deal-state"><CircleCheck size={14} aria-hidden="true" /> Offer received</span>
          </div>
          <div className="landing-demo landing-demo-money">
            <span className="landing-demo-label"><Wallet size={15} aria-hidden="true" /> Earnings</span>
            <strong>₹24,000</strong>
            <small>This month</small>
            <div className="landing-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
          </div>
        </div>
      </div>
      <figcaption className="sr-only">An illustrative workspace showing a creator match, a deal offer and monthly earnings.</figcaption>
    </figure>
  );
}
