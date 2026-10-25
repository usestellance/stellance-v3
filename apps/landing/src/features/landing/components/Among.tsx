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
          className="relative bg-primary-500 text-neutral-500 rounded-[15px] md:rounded-[30px] py-[30px] px-[15px] md:py-[27px] md:px-[30px] lg:pl-[60px] lg:pr-[60px] sm:flex sm:gap-2.5 sm:items-center md:gap-10 lg:gap-[72px]"
        >
          <div data-cta-copy className="relative flex flex-col items-center sm:w-1/2 sm:items-start sm:justify-center lg:max-w-[565px]">
            <h4 className="font-bold text-center text-xl sm:text-start lg:text-[32px] tracking-[0.01em]">
              Get paid on time, every time
            </h4>
            <p className="text-center text-sm w-4/5 max-sm:mx-auto mt-2.5 sm:text-start sm:w-full lg:mt-4 lg:text-2xl tracking-[0.01em] opacity-85">
              Create, send, and manage professional invoices in just a few clicks.
              Stellance&apos;s intuitive invoicing system is designed for
              freelancers, with smart templates and verified payments.
              <br />
              <br />
              Sign up today and experience the freedom of Stellar-powered
              freelance finance.
            </p>
            <div className="relative mt-4 lg:mt-[27px]">
              <Button
                onClick={gotoSignUp}
                variant="secondary"
                className="rounded-[34px] w-[170px] lg:w-[200px] lg:h-[60px] text-primary-500 text-sm lg:text-lg font-medium"
              >
                Get Started Now
              </Button>
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG doodle */}
              <img aria-hidden src="/images/landing/doodle-cta.svg" alt="" className="pointer-events-none absolute left-[calc(100%-14px)] top-[-6px] w-[110px] lg:w-[176px] max-sm:hidden" />
            </div>
          </div>
          <div className="rounded-[9.9px] md:rounded-[15px] overflow-hidden max-sm:mt-[30px] sm:w-1/2 sm:aspect-[563/505]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static marketing photo, served as-is */}
            <img
              data-cta-image
              alt="Freelancer smiling at her phone with a cup in hand"
              src="/images/landing/cta-woman.png"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Among;
