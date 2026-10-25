"use client";
import Image from "next/image";
import React, { useRef } from "react";
import { gsap, revealOnScroll, useMotion } from "@/features/landing/motion";

const YourWork = () => {
  const scope = useRef<HTMLElement>(null);

  useMotion(scope, ({ isDesktop }) => {
    const root = scope.current!;
    revealOnScroll("[data-vision-copy] > *", root);
    gsap.from("[data-vision-image]", {
      x: isDesktop ? 48 : 0,
      y: isDesktop ? 0 : 32,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: { trigger: root, start: "top 75%", once: true },
    });
  });

  return (
    <section ref={scope} id="vision" className="py-[60px] md:py-24 lg:py-[120px] overflow-x-clip">
      <div className="landing-container sm:flex sm:items-center gap-10 md:gap-[60px] sm:justify-between">
        <div data-vision-copy className="flex flex-col items-center gap-5 sm:w-1/2 lg:max-w-[651px]">
          <p className="flex h-[42px] lg:h-[50px] w-[180px] lg:w-[230px] items-center justify-center rounded-[30px] bg-primary-500/5 text-lg lg:text-2xl text-primary-500">
            Stellance
          </p>
          <h2 className="text-[32px] text-center text-black-500 lg:text-[48px] leading-[120%]">
            Our Vision
          </h2>
          <p className="text-black-400 text-center text-base tracking-[0.01em] sm:text-lg lg:text-[24px]">
            We believe businesses in Africa and emerging markets deserve the
            same seamless financial tools available anywhere in the world.
            Stellance is not just an invoicing platform; it&apos;s a bridge to
            global opportunity.
          </p>
        </div>
        <div data-vision-image className="w-full mt-[30px] sm:mt-0 sm:w-1/2 max-w-[610px] aspect-[610/700] overflow-hidden">
          <Image
            alt="Freelancer working on a laptop with a dog beside him"
            height={1423}
            width={1240}
            src="/images/landing/vision.png"
            sizes="(min-width: 640px) 45vw, 100vw"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default YourWork;
