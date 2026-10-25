"use client";
import React, { useRef } from "react";
import { gsap, revealOnScroll, useMotion } from "@/features/landing/motion";

const BENEFITS = [
  { title: "Faster Cash Flow", text: "No more waiting 3–5 business days for international wire transfers." },
  { title: "Reduced Payment Costs", text: "Avoid high remittance fees and poor exchange rates." },
  { title: "Global Reach", text: "Serve clients anywhere in the world without banking limitations." },
  { title: "Financial Transparency", text: "Clear transaction tracking and automated record-keeping." },
  { title: "Scalable Infrastructure", text: "Built on blockchain technology, Stellance grows with your business." },
];

/**
 * Wide layout from the design (1320 wide): three benefits across, two below, joined by dashed curves.
 * x and widths are percentages of 1320 so it scales down to 1280; y stays in pixels.
 */
const WIDE_POSITIONS = [
  { left: "0%", top: 0 },
  { left: "34.85%", top: 0 },
  { left: "69.7%", top: 0 },
  { left: "17.42%", top: 385 },
  { left: "52.27%", top: 365 },
];
const CONNECTORS = [
  { src: "/images/landing/connector-1.svg", left: "22.8%", top: 50, width: "17.5%" },
  { src: "/images/landing/connector-2.svg", left: "57.65%", top: 50, width: "17.5%" },
  { src: "/images/landing/connector-3.svg", left: "40.45%", top: 410, width: "17.5%" },
  { src: "/images/landing/connector-left.svg", left: "7.4%", top: 300, width: "6.9%" },
  { src: "/images/landing/connector-right.svg", left: "78.6%", top: 288, width: "7.4%" },
];

function Benefit({ title, text }: { title: string; text: string }) {
  return (
    <div data-benefit className="flex flex-col items-center gap-5 text-center sm:last:col-span-2">
      <span className="flex size-20 lg:size-[100px] items-center justify-center rounded-full bg-[rgba(217,228,248,0.4)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- small SVG icon */}
        <img src="/images/landing/icon-bulb.svg" alt="" aria-hidden className="h-10 w-9 lg:h-[50px] lg:w-[45px]" />
      </span>
      <div className="flex flex-col gap-[5px]">
        <h3 className="text-2xl font-bold leading-8 text-black lg:text-[32px] lg:leading-10">{title}</h3>
        <p className="text-lg leading-6 text-[#4c4c4c] lg:text-2xl lg:leading-[25px]">{text}</p>
      </div>
    </div>
  );
}

const Benefits = () => {
  const scope = useRef<HTMLElement>(null);

  useMotion(scope, () => {
    const root = scope.current!;
    revealOnScroll("[data-benefits-head] > *", root.querySelector("[data-benefits-head]"));
    revealOnScroll(root.querySelectorAll("[data-benefit]"), root.querySelector("[data-benefits-body]"), { y: 36, stagger: 0.12 });
    gsap.from(root.querySelectorAll("[data-connector]"), {
      clipPath: "inset(0 100% 0 0)",
      duration: 1,
      ease: "power2.inOut",
      stagger: 0.15,
      scrollTrigger: { trigger: root.querySelector("[data-benefits-body]"), start: "top 75%", once: true },
    });
  });

  return (
    <section ref={scope} id="benefits" className="py-[60px] lg:py-[120px] overflow-x-clip">
      <div className="landing-container">
        <div data-benefits-head className="flex flex-col items-center gap-5">
          <p className="flex h-[42px] lg:h-[50px] w-[180px] lg:w-[230px] items-center justify-center rounded-[30px] bg-primary-500/5 text-lg lg:text-2xl text-primary-500">
            Key Benefits
          </p>
          <h2 className="max-w-[531px] text-center text-[32px] leading-tight text-black-500 lg:text-[48px]">
            Why Businesses Choose Stellance
          </h2>
        </div>

        <div data-benefits-body className="mt-12 lg:mt-[90px]">
          {/* Phones and tablets: a simple grid. */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 xl:hidden">
            {BENEFITS.map((b) => (
              <Benefit key={b.title} {...b} />
            ))}
          </div>
          {/* Wide screens: the staggered layout with dashed connectors. */}
          <div className="relative mx-auto hidden h-[560px] max-w-[1320px] xl:block">
            {CONNECTORS.map((c) => (
              // eslint-disable-next-line @next/next/no-img-element -- decorative SVG connector
              <img key={c.src} data-connector aria-hidden src={c.src} alt="" className="absolute" style={{ left: c.left, top: c.top, width: c.width }} />
            ))}
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="absolute w-[30.3%]" style={WIDE_POSITIONS[i]}>
                <Benefit {...b} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
