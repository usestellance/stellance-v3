"use client";
import React, { useRef } from "react";
import { SplitText, gsap, useMotion } from "@/features/landing/motion";

const EveryPayment = () => {
  const scope = useRef<HTMLElement>(null);

  // The statement fills in word by word as it is read, tied to the scroll.
  useMotion(scope, () => {
    const split = SplitText.create(scope.current!.querySelector("[data-statement]"), { type: "words" });
    gsap.from(split.words, {
      opacity: 0.18,
      stagger: 0.08,
      ease: "none",
      scrollTrigger: { trigger: scope.current, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
    });
  });

  return (
    <section ref={scope} className="bg-primary-500 py-[30px] sm:py-14 md:py-[60px] lg:py-[150px] text-neutral-500">
      <div className="landing-container text-center">
        <p
          data-statement
          className="font-bold text-sm leading-[190%] md:leading-[150%] w-4/5 mx-auto sm:text-2xl md:text-4xl lg:text-[64px] lg:leading-normal"
        >
          Why Stellance? <br /> Traditional invoicing was built for local
          banking. Stellance is built for the{" "}
          <strong> global digital economy</strong>. <br />
          <br /> Invoices that know when they&apos;ve been paid, and payments
          that settle in seconds, anywhere.
        </p>
      </div>
    </section>
  );
};

export default EveryPayment;
