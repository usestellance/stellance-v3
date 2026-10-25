"use client";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@repo/ui/button";
import { APP_LINKS } from "@/lib/site";
import { gsap, revealWords, useMotion } from "@/features/landing/motion";

/**
 * Floating product cards around the phone, placed as in the design (Figma "Desktop - 409"): positions are
 * percentages of the hand-and-phone artwork box (1186 × 889 at 1440 wide) so they scale with it.
 */
const FLOATS = [
  { src: "/images/landing/float-invoice.png", alt: "Invoice preview", left: "59.2%", top: "27.4%", width: "11.1%", w: 445, h: 259 },
  { src: "/images/landing/float-members.png", alt: "Add members to an invoice", left: "27.2%", top: "39.8%", width: "12.6%", w: 447, h: 234 },
  { src: "/images/landing/float-wallet.png", alt: "Wallet balance", left: "27.5%", top: "64.1%", width: "12.8%", w: 474, h: 267 },
  { src: "/images/landing/float-receipt.png", alt: "Paid invoice receipt", left: "61.3%", top: "55.1%", width: "12.6%", w: 447, h: 276 },
];

const Hero = () => {
  const scope = useRef<HTMLDivElement>(null);
  const gotoSignUp = () => window.location.assign(APP_LINKS.signUp);

  useMotion(scope, ({ isDesktop }) => {
    const root = scope.current!;
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .add(revealWords(root.querySelector("[data-hero-title]"))!)
      .from("[data-hero-copy]", { y: 16, opacity: 0, duration: 0.6 }, "-=0.45")
      .from("[data-hero-cta]", { y: 16, opacity: 0, duration: 0.5 }, "-=0.35");

    if (isDesktop) {
      intro.from("[data-hero-phone]", { y: 80, opacity: 0, duration: 1, ease: "power2.out" }, 0.2);
      intro.from("[data-hero-float]", { y: 24, opacity: 0, scale: 0.94, duration: 0.6, stagger: 0.12, ease: "back.out(1.6)" }, 0.8);
      intro.from("[data-hero-doodle]", { opacity: 0, duration: 0.8, stagger: 0.2 }, 1.1);
      // The cards drift a little, out of step with each other: the product, alive but calm.
      gsap.utils.toArray<HTMLElement>("[data-hero-float]").forEach((card, i) => {
        gsap.to(card, { y: i % 2 ? 8 : -8, duration: 2.6 + i * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.6 });
      });
      // The phone drifts up a little as the page scrolls away: depth without distraction.
      gsap.to("[data-hero-phone]", {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    }
  });

  return (
    <div ref={scope} className="relative min-h-[75vh] sm:min-h-0 lg:h-[65.5vw] lg:max-h-[943px] overflow-hidden pt-28 sm:pt-40 lg:pt-0 pb-10 sm:pb-0">
      {/* Soft light rising from the bottom of the gradient, and the line art behind the phone. */}
      <div aria-hidden className="pointer-events-none absolute left-[-4%] top-[69%] h-[111%] w-[108%] rounded-[50%] bg-[linear-gradient(90deg,rgba(245,245,245,0.4)_0%,rgba(175,175,175,0.4)_50%,rgba(255,255,255,0.4)_100%)] opacity-65 blur-[275px]" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG line art */}
      <img aria-hidden src="/images/landing/hero-lines.svg" alt="" className="pointer-events-none absolute left-[47%] top-[-8.4%] w-[70%] max-lg:hidden min-[90rem]:left-[calc(50%-44px)] min-[90rem]:w-[1008px]" />

      <div className="landing-container relative h-full lg:flex lg:items-center">
        <div className="w-full lg:w-[40%] xl:w-[47%] lg:pt-[120px] flex flex-col justify-center text-neutral-500">
          <h1
            data-hero-title
            className="font-normal text-[32px] leading-10 sm:text-[48px] sm:leading-[120%] xl:text-[64px] tracking-[-0.01em] max-sm:text-center"
          >
            Do business worldwide, receive money without borders
          </h1>
          <p
            data-hero-copy
            className="text-sm sm:text-xl xl:text-2xl mt-[15px] md:mt-[30px] text-neutral-comment leading-6 sm:leading-[150%] tracking-[-0.01em] max-sm:text-center lg:max-w-[632px]"
          >
            A simple payment process helps you get paid on time. Your customers pay in USDC from any Stellar
            wallet, by QR code or payment link, and every payment is checked against its invoice.
          </p>
          <div data-hero-cta className="max-sm:mx-auto mt-10 md:mt-[30px]">
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

      {/*
        Hand, phone and floating cards: 1186 × 889 at 1440, anchored bottom-left at 27.6% and allowed to run off the
        right edge. Tablets get it in the flow under the copy; 1024–1279 shifts it right to clear the narrower text;
        from 1440 it keeps the design size, centred with the content like the 1440 frame.
      */}
      <div className="relative hidden sm:block mx-auto mt-10 w-[110%] max-w-[760px] translate-x-[6%] aspect-[1186/889] lg:absolute lg:mt-0 lg:max-w-none lg:translate-x-0 lg:bottom-0 lg:left-[38%] lg:w-[68%] xl:left-[27.6%] xl:w-[82.4%] min-[90rem]:left-[calc(50%-323px)] min-[90rem]:w-[1186px]">
        <div data-hero-phone className="absolute inset-0">
          <Image
            src="/images/landing/hero-hand-phone.png"
            alt="Stellance on a phone"
            fill
            priority
            sizes="82vw"
            className="object-contain object-bottom"
          />
        </div>
        {FLOATS.map((f) => (
          <div key={f.src} data-hero-float className="absolute" style={{ left: f.left, top: f.top, width: f.width }}>
            <Image src={f.src} alt={f.alt} width={f.w} height={f.h} className="h-auto w-full drop-shadow-[0_6px_14px_rgba(0,12,59,0.25)]" />
          </div>
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG doodle */}
        <img data-hero-doodle aria-hidden src="/images/landing/doodle-hero-left.svg" alt="" className="absolute left-[11.8%] top-[65.4%] w-[12.2%] hidden min-[90rem]:block" />
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG doodle */}
        <img data-hero-doodle aria-hidden src="/images/landing/doodle-hero-right.svg" alt="" className="absolute left-[67.4%] top-[17.2%] w-[14.2%] max-xl:hidden" />
      </div>
    </div>
  );
};

export default Hero;
