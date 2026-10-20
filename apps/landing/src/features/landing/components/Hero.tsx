"use client";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@repo/ui/button";
import { APP_LINKS } from "@/lib/site";
import { gsap, revealWords, useMotion } from "@/features/landing/motion";
import { PaymentStatusDemo } from "@/features/landing/components/PaymentStatusDemo";

const Hero = () => {
  const scope = useRef<HTMLDivElement>(null);
  const gotoSignUp = () => window.location.assign(APP_LINKS.signUp);

  useMotion(scope, ({ isDesktop }) => {
    const root = scope.current!;
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from("[data-hero-pill]", { y: 12, opacity: 0, duration: 0.5 })
      .add(revealWords(root.querySelector("[data-hero-title]"))!, "-=0.2")
      .from("[data-hero-copy]", { y: 16, opacity: 0, duration: 0.6 }, "-=0.45")
      .from("[data-hero-cta]", { y: 16, opacity: 0, duration: 0.5 }, "-=0.35");

    if (isDesktop) {
      intro.from("[data-hero-phone]", { y: 80, opacity: 0, duration: 1, ease: "power2.out" }, 0.2);
      // The phone drifts up a little as the page scrolls away: depth without distraction.
      gsap.to("[data-hero-phone]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    }
  });

  return (
    <div ref={scope} className="min-h-[75vh] sm:min-h-screen relative pt-28 sm:pt-40 pb-10">
      <div className="landing-container flex justify-between h-full gap-20">
        <div className="w-full xl:w-1/2 flex flex-col justify-center text-neutral-500">
          <p
            data-hero-pill
            className="mb-5 w-fit max-sm:mx-auto rounded-full border border-neutral-500/30 bg-neutral-500/10 px-4 py-1.5 text-xs font-medium sm:text-sm"
          >
            Live on Stellar Testnet
          </p>
          <h1
            data-hero-title
            className="font-medium text-[32px] sm:text-[48px] leading-10 md:text-[64px] md:font-normal sm:leading-[120%]"
          >
            Invoice anyone, anywhere. Get paid in seconds.
          </h1>
          <p
            data-hero-copy
            className="text-sm sm:text-2xl my-[15px] md:my-[30px] text-neutral-comment leading-6 sm:leading-[150%]"
          >
            Stellance turns every invoice into a payment request your client
            can pay in USDC on the Stellar network. Each payment is detected,
            checked against the invoice and matched automatically, so you know
            exactly when you&apos;ve been paid, with a receipt anyone can
            verify on-chain.
          </p>
          <div data-hero-cta className="max-sm:mx-auto mt-10 max-md:mt-10">
            <Button
              onClick={gotoSignUp}
              variant="secondary"
              className="rounded-[30px] max-w-60 text-primary-500 sm:max-w-[300px] h-[60px]"
            >
              Sign up for free
            </Button>
          </div>
        </div>
        <div className=" w-1/2 max-lg:hidden"></div>
      </div>
      <div
        data-hero-phone
        className="max-lg:hidden xl:h-[600px] lg:h-[400px] absolute right-0 bottom-0"
      >
        <Image
          src="/images/phone_hand.png"
          alt="Stellance on a phone"
          width={500}
          loading="eager"
          height={500}
          className="h-full w-full object-contain"
        />
        <PaymentStatusDemo className="absolute top-[18%] -left-24 xl:-left-16" />
      </div>
    </div>
  );
};

export default Hero;
