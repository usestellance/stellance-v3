"use client";
import Image from "next/image";
import React, { useRef } from "react";
import { Button } from "@repo/ui/button";
import { APP_LINKS } from "@/lib/site";
import { gsap, revealOnScroll, useMotion } from "@/features/landing/motion";

/** Closing call to action: headline, sign-up button, and a strip of the product rising from the bottom edge. */
const StartSending = () => {
  const scope = useRef<HTMLElement>(null);
  const gotoSignUp = () => window.location.assign(APP_LINKS.signUp);

  useMotion(scope, () => {
    const root = scope.current!;
    revealOnScroll("[data-start-copy] > *", root);
    gsap.from("[data-start-doodle]", { opacity: 0, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: root, start: "top 75%", once: true } });
    gsap.from("[data-start-strip]", {
      yPercent: 30,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: root, start: "top 65%", once: true },
    });
  });

  return (
    <section ref={scope} className="relative overflow-hidden bg-primary-500 text-neutral-500 pt-[60px]">
      <div className="landing-container">
        <div className="relative mx-auto max-w-[715px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG doodle */}
          <img data-start-doodle aria-hidden src="/images/landing/doodle-start-left.svg" alt="" className="pointer-events-none absolute left-0 top-[10px] w-[120px] lg:w-[176px] max-md:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG doodle */}
          <img data-start-doodle aria-hidden src="/images/landing/doodle-start-right.svg" alt="" className="pointer-events-none absolute right-0 top-[66px] w-[115px] lg:w-[168px] max-md:hidden" />
          <div data-start-copy className="mx-auto flex max-w-[651px] flex-col items-center gap-5 text-center">
            <h2 className="text-[32px] font-bold leading-tight lg:text-[48px]">
              Start Sending Your
              <br />
              Invoice for Free
            </h2>
            <p className="text-base tracking-[0.01em] sm:text-lg lg:text-2xl">
              Invoice software that lets you send professional invoices, accept USDC payments online and know the
              moment you&apos;re paid.
            </p>
            {/* Wrapped: the reveal animates this div, never the Button (its CSS transition fights the tween). */}
            <div>
              <Button
                onClick={gotoSignUp}
                variant="secondary"
                className="rounded-[30px] w-60 sm:w-[300px] h-[60px] text-primary-500 text-lg font-medium"
              >
                Sign up for free
              </Button>
            </div>
          </div>
        </div>

        {/* The product strip, cut off by the section's bottom edge as in the design (top 238 of 428 at 1228 wide). */}
        <div className="mx-auto mt-[60px] max-w-[1228px] overflow-hidden aspect-[1228/238] max-sm:aspect-[1228/300]">
          <div data-start-strip>
            <Image
              src="/images/landing/start-ui-strip.png"
              alt="Stellance analytics, a paid invoice and an invoice with team comments"
              width={2471}
              height={871}
              sizes="(min-width: 1300px) 1228px, 92vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartSending;
