"use client";

import { useEffect, type RefObject } from "react";

/**
 * Scroll choreography for the landing page (GSAP + ScrollTrigger).
 *
 * Loaded lazily so the signed-in app never ships GSAP. Only below-the-fold or
 * scrubbed effects live here; the load sequence is CSS, so nothing depends on
 * this script to become visible. Nothing is pinned and scrolling is never
 * hijacked. Everything is skipped under prefers-reduced-motion, and the heavier
 * parallax only runs on wide, hover-capable screens.
 */
export function useLandingMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 768px) and (hover: hover)" },
        (ctx) => {
          const { motion, wide } = ctx.conditions as { motion: boolean; wide: boolean };
          if (!motion) return;
          const q = gsap.utils.selector(el);

          // Hero: as you scroll away the two stacks slide together over the dial
          // and the headline drifts up a little slower than the page.
          const hero = q("[data-hero]")[0];
          if (hero) {
            const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 } });
            tl.to(q('[data-stack-wrap="left"]'), { xPercent: wide ? 22 : 12, rotate: 4, ease: "none" }, 0)
              .to(q('[data-stack-wrap="right"]'), { xPercent: wide ? -22 : -12, rotate: -4, ease: "none" }, 0)
              .to(q("[data-dial]"), { scale: 1.12, ease: "none" }, 0)
              .to(q("[data-hero-title]"), { yPercent: wide ? -18 : -8, ease: "none" }, 0);
          }

          // Manifesto: words ink in as the paragraph moves through the viewport.
          const words = q("[data-manifesto] [data-word]");
          if (words.length) {
            gsap.fromTo(
              words,
              { opacity: 0.16 },
              { opacity: 1, ease: "none", stagger: 0.05, scrollTrigger: { trigger: q("[data-manifesto]")[0], start: "top 80%", end: "bottom 45%", scrub: true } },
            );
          }

          // Story photos drift inside their frames (wide screens only).
          if (wide) {
            q("[data-parallax]").forEach((p) => {
              gsap.fromTo(p, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: p.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
            });
          }

          // Collab flow: the rule draws across, then the four steps settle in once.
          const rule = q("[data-flow-rule]")[0];
          if (rule) {
            gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: rule, start: "top 85%", end: "top 40%", scrub: true } });
            gsap.from(q("[data-flow-item]"), {
              y: 48,
              opacity: 0,
              duration: 1,
              ease: "expo.out",
              stagger: 0.09,
              scrollTrigger: { trigger: rule, start: "top 75%", once: true },
            });
          }
        },
        el,
      );

      revert = () => mm.revert();
      // Fonts and images change heights after first paint; re-measure once settled.
      document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [root]);
}
