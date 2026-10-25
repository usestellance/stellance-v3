"use client";
import React, { useRef } from "react";
import { gsap, revealOnScroll, useMotion } from "@/features/landing/motion";

/** Features as frosted cards on the dark gradient (Figma "Desktop - 409", Features). */
const FEATURES: { title: string; icon: string; text: string; bullets?: string[] }[] = [
  {
    title: "Instant Cross Border Payments",
    icon: "/images/landing/icon-network.svg",
    text: "Send invoices globally and receive payments within seconds, not days. Stellar’s fast settlement ensures smooth transactions across borders.",
  },
  {
    title: "Payment Links & QR Codes",
    icon: "/images/landing/icon-agent.svg",
    text: "Every invoice gets its own payment page with the amount, wallet and memo filled in, plus a QR code any Stellar wallet can scan.",
  },
  {
    title: "Smart Invoice Management",
    icon: "/images/landing/icon-energy.svg",
    text: "Create, customize, and track invoices in real time.",
    bullets: ["Payment status tracking", "Client review and comments", "Downloadable invoice history"],
  },
  {
    title: "Low Transaction Fee",
    icon: "/images/landing/icon-energy.svg",
    text: "Keep more of your revenue. Stellar’s near-zero transaction fees reduce overhead costs significantly compared to traditional remittance systems.",
  },
  {
    title: "Secure & Transparent",
    icon: "/images/landing/icon-energy.svg",
    text: "Every transaction is recorded on-chain, ensuring transparency, traceability, and tamper-resistant records.",
  },
  {
    title: "Automatic Payment Detection",
    icon: "/images/landing/icon-energy.svg",
    text: "Stellance watches the network and matches each payment to its invoice the moment it lands. No screenshots, no “I’ve paid” emails.",
  },
];

const Features = () => {
  const scope = useRef<HTMLElement>(null);

  useMotion(scope, () => {
    const root = scope.current!;
    revealOnScroll("[data-features-head] > *", root.querySelector("[data-features-head]"));
    gsap.utils.toArray<HTMLElement>("[data-feature]").forEach((card, i) => {
      revealOnScroll(card, card, { y: 40, delay: (i % 3) * 0.08 });
    });
  });

  return (
    <section
      ref={scope}
      id="features"
      className="bg-[linear-gradient(200deg,#000c3b_63%,#0021a1_100%)] text-neutral-500 py-[60px] lg:pb-[120px]"
    >
      <div className="landing-container">
        <div data-features-head className="flex flex-col items-center gap-2.5">
          <p className="flex h-[42px] lg:h-[50px] w-[180px] lg:w-[230px] items-center justify-center rounded-[30px] bg-[rgba(200,206,229,0.2)] text-lg lg:text-2xl">
            Features
          </p>
          <p className="text-center text-neutral-comment text-base leading-7 md:text-2xl md:leading-10 max-w-[1200px]">
            Everything between “invoice sent” and “payment verified”, on fast, low-cost Stellar rails.
          </p>
        </div>

        <div className="mt-10 lg:mt-[100px] grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              data-feature
              className="relative min-h-[300px] xl:min-h-[440px] rounded-[20px] border border-[rgba(112,119,129,0.42)] bg-[rgba(153,153,153,0.4)] p-[30px] backdrop-blur-[21px]"
            >
              <span className="absolute right-[30px] top-[30px] flex size-[52px] lg:size-[60px] items-center justify-center rounded-full border border-[rgba(2,80,172,0.27)] bg-[rgba(2,80,172,0.39)] backdrop-blur-[21px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- small SVG icon */}
                <img src={f.icon} alt="" aria-hidden className="size-[26px] lg:size-[30px]" />
              </span>
              <h3 className="max-w-[calc(100%-80px)] text-[28px] font-bold leading-[34px] lg:text-[36px] lg:leading-10">{f.title}</h3>
              <p className="mt-[30px] text-neutral-comment text-lg leading-8 lg:text-2xl lg:leading-10">{f.text}</p>
              {f.bullets && (
                <ul className="mt-1 list-disc pl-6 text-neutral-comment text-lg leading-8 lg:text-2xl lg:leading-10">
                  {f.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
