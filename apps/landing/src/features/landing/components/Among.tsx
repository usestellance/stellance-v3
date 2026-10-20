"use client";
import React, { useRef } from "react";
import { Button } from "@repo/ui/button";
import { APP_LINKS } from "@/lib/site";
import { gsap, useMotion } from "@/features/landing/motion";

const Among = () => {
  const scope = useRef<HTMLElement>(null);
  const gotoSignUp = () => window.location.assign(APP_LINKS.signUp);

  useMotion(scope, () => {
    const timeline = gsap.timeline({ scrollTrigger: { trigger: scope.current, start: "top 75%", once: true } });
    timeline
      .from("[data-cta-card]", { y: 40, opacity: 0, scale: 0.98, duration: 0.8, ease: "power3.out" })
      .from("[data-cta-copy] > *", { y: 16, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.4")
      .from("[data-cta-image]", { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "power3.inOut" }, "-=0.6");
  });

  return (
    <section ref={scope} className="pt-[58px] pb-[100px] lg:pb-[150px] lg:pt-[150px]">
      <div className="landing-container">
        <div
          data-cta-card
          className="bg-primary-500 text-neutral-500 rounded-[15px] md:rounded-[30px] py-[30px] px-[15px] md:py-[27px] md:px-[30px] lg:px-[60px] sm:flex sm:gap-2.5 sm:items-center md:gap-10"
        >
          <div data-cta-copy className="flex flex-col items-center sm:w-1/2 sm:items-start sm:justify-center">
            <h4 className="font-bold text-center text-xl sm:text-start lg:text-[32px]">
              Get paid on time, <br />
              every time
            </h4>
            <p className="text-center text-sm w-4/5 max-sm:mx-auto mt-2.5 sm:text-start sm:w-full lg:mt-4 lg:text-2xl">
              Invoice smarter. Get paid faster. Work with clients anywhere.{" "}
              <br /> <br />
              <strong>
                Stellance, where business meets borderless payments.
              </strong>
              <br />
              <br /> Sign up free and send your first invoice in minutes.
            </p>
            <div className="mt-4 lg:mt-[27px]">
              <Button
                onClick={gotoSignUp}
                variant="secondary"
                className="rounded-[30px] max-w-[170px] text-primary-500 text-sm"
              >
                Get Started Now
              </Button>
            </div>
          </div>
          <div className="rounded-[9.9px] md:rounded-[15px] overflow-hidden h-full max-sm:mt-[30px] sm:w-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element -- static marketing photo, served as-is */}
            <img
              data-cta-image
              alt="Freelancer smiling at her phone with a cup in hand"
              src="/images/girl_with_phone.png"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Among;
