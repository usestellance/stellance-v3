"use client";

import { type RefObject, useEffect, useEffectEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

export interface MotionContext {
	/** ≥1024px — the layouts with pinned / fanned motion. */
	isDesktop: boolean;
}

/**
 * Runs a section's GSAP setup scoped to `scope`, only for visitors who haven't asked for reduced
 * motion (they get the final, static layout), and re-runs it when the desktop/mobile breakpoint
 * flips. Everything created inside is reverted on unmount or breakpoint change — no global kills.
 */
export function useMotion(scope: RefObject<HTMLElement | null>, setup: (context: MotionContext) => void | (() => void)) {
	const run = useEffectEvent(setup);
	useEffect(() => {
		const element = scope.current;
		if (!element) return;
		const mm = gsap.matchMedia(element);
		mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" }, (context) => {
			if (!context.conditions?.motion) return;
			return run({ isDesktop: Boolean(context.conditions.desktop) });
		});
		return () => mm.revert();
	}, [scope]);
}

/**
 * Headline reveal: words rise out of a mask, one after another. Returns the tween; the split
 * is undone when the surrounding matchMedia context reverts.
 */
export function revealWords(target: Element | null, vars: gsap.TweenVars = {}) {
	if (!target) return null;
	const split = SplitText.create(target, { type: "lines,words", mask: "lines", linesClass: "pb-[0.08em]" });
	return gsap.from(split.words, { yPercent: 110, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, ...vars });
}

/** The standard entrance for content as it scrolls into view: a short lift and fade, once. */
export function revealOnScroll(targets: gsap.TweenTarget, trigger: Element | null, vars: gsap.TweenVars = {}) {
	if (!trigger) return null;
	return gsap.from(targets, {
		y: 32,
		opacity: 0,
		duration: 0.7,
		ease: "power2.out",
		stagger: 0.1,
		scrollTrigger: { trigger, start: "top 82%", once: true },
		...vars,
	});
}
