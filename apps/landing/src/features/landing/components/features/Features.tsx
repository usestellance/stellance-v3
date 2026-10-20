"use client";
import React, { useRef } from "react";
import FeatureCard from "@/features/landing/components/features/FeatureCard";
import { gsap, revealOnScroll, useMotion } from "@/features/landing/motion";

const Features = () => {
  const scope = useRef<HTMLElement>(null);

  useMotion(scope, ({ isDesktop }) => {
    const root = scope.current!;
    revealOnScroll("[data-features-head] > *", root.querySelector("[data-features-head]"));
    gsap.utils.toArray<HTMLElement>("[data-feature]").forEach((card, i) => {
      revealOnScroll(card.querySelector("[data-feature-copy]"), card, { y: 24 });
      // Images slide in from alternating sides on wide screens, straight up on phones.
      gsap.from(card.querySelector("[data-feature-image]"), {
        x: isDesktop ? (i % 2 ? -40 : 40) : 0,
        y: isDesktop ? 0 : 24,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 80%", once: true },
      });
    });
  });

  const featureDetails = [
    {
      title: "1. Instant Cross-Border Payments",
      img: "/images/feature_1.png",
      text: "Send invoices globally and receive payments within seconds, not days. Stellar’s fast settlement keeps money moving across borders.",
      class: "md:col-span-2 md:flex-row md:items-center",
    },
    {
      title: "2. Payment Links & QR Codes",
      img: "/images/feature_2.png",
      text: "Every invoice gets its own payment page with the amount, wallet and memo filled in, plus a QR code any Stellar wallet can scan.",
      class: "md:items-center md:flex-col-reverse",
    },
    {
      title: "3. Automatic Payment Detection",
      img: "/images/feature_3.png",
      text: "Stellance watches the network and picks up your client’s payment the moment it lands. No screenshots, no “I’ve paid” emails.",
      class: "md:items-center",
    },
    {
      title: "4. Verified Before It’s Paid",
      img: "/images/feature_1.png",
      text: "Recipient, asset, amount and payment reference are checked before an invoice is marked paid. Short, wrong or unmatched payments are flagged for review.",
      class: "md:col-span-2 md:flex-row-reverse md:items-center",
    },
    {
      title: "5. Low Transaction Fees",
      img: "/images/feature_1.png",
      text: "Keep more of your revenue. Stellar’s near-zero network fees cost a fraction of traditional remittance.",
      class: "md:items-center",
    },
    {
      title: "6. Transparent, Exportable Records",
      img: "/images/feature_2.png",
      text: "Every payment carries its transaction hash and explorer link. Track invoice status in real time and export your history to PDF or Excel.",
      class: "md:items-center md:flex-col-reverse",
    },
    {
      title: "7. Built for Working With Clients",
      img: "/images/feature_3.png",
      text: "Send invoices by email, let clients review, comment and approve them, and get notified as payments arrive.",
      class: "md:col-span-2 md:flex-row md:items-center",
    },
  ];
  return (
    <section ref={scope} id="features" className="pb-20 md:pt-10 lg:pb-[200px]">
      <div className="landing-container">
        <div data-features-head>
          <h2 className="text-2xl text-center font-bold md:text-[32px]">
            FEATURES
          </h2>
          <p className="text-center text-neutral-900 mt-5 max-md:max-w-md md:max-w-2xl mx-auto md:text-2xl md:text-black-400">
            Everything between “invoice sent” and “payment verified”, on fast,
            low-cost Stellar rails.
          </p>
        </div>
        <div className="mt-20 rounded-[15px] md:border border-primary-500/50 md:bg-linear-to-tr md:from-[#dee4fa] md:to-neutral-500 md:grid md:grid-cols-2 lg:overflow-hidden">
          {featureDetails.map((d, i) => (
            <FeatureCard
              key={i}
              img={d.img}
              text={d.text}
              title={d.title}
              className={d.class}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
