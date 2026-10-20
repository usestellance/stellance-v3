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
    <section ref={scope} className="py-[60px] md:py-24 lg:py-40 overflow-x-clip">
      <div className="landing-container sm:flex sm:items-center gap-10 md:gap-[60px] sm:justify-between">
        <div data-vision-copy className="sm:w-1/2">
          <h2 className="text-[32px] font-bold text-center sm:text-start lg:text-[48px] leading-[120%]">
            OUR VISION
          </h2>
          <p className="text-black-500 text-center text-sm mt-5 sm:text-start lg:text-[24px]">
            We believe businesses in Africa and emerging markets deserve the
            same seamless financial tools available anywhere in the world.
            Stellance is not just an invoicing platform; it&apos;s a bridge to
            global opportunity.
          </p>
        </div>
        <div data-vision-image className="w-full mt-[30px] sm:w-1/2 max-w-[550px]">
          <Image
            alt="Freelancer working on a laptop with a dog beside him"
            height={500}
            width={500}
            src="/images/your_work.png"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default YourWork;
