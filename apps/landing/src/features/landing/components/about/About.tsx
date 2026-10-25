"use client";
import React, { useRef } from "react";
import AboutCard from "@/features/landing/components/about/AboutCard";
import { gsap, revealOnScroll, revealWords, useMotion } from "@/features/landing/motion";

const About = () => {
  const scope = useRef<HTMLElement>(null);

  useMotion(scope, () => {
    const root = scope.current!;
    // One heading per breakpoint; the hidden one simply animates unseen.
    root.querySelectorAll("[data-about-title]").forEach((title) =>
      revealWords(title, { scrollTrigger: { trigger: root, start: "top 75%", once: true } }),
    );
    revealOnScroll("[data-about-intro]", root.querySelector("[data-about-intro]"));
    gsap.utils.toArray<HTMLElement>("[data-about-card]").forEach((card) => {
      revealOnScroll(card, card, { y: 48 });
      // The photo settles from a slight zoom, like a lens finding focus.
      gsap.from(card.querySelector("img"), {
        scale: 1.08,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 85%", once: true },
      });
    });
  });

  const aboutDetails = [
    {
      title: "Invoices clients approve",
      img: "/images/landing/platform-invoice.png",
      text: "Pick a template, add your items and send it by email. Your client can review it, leave comments and approve it before paying.",
      class: "lg:flex-col-reverse lg:col-span-3",
      imgClass: "object-left",
    },
    {
      title: "Paid in USDC on Stellar",
      img: "/images/landing/platform-coins.png",
      text: "Clients pay from any Stellar wallet with a QR code or payment link. Funds settle in seconds, for a fraction of a cent.",
      class: "lg:col-span-4",
    },
    {
      title: "Every payment verified",
      img: "/images/landing/platform-cubes.png",
      text: "Recipient, asset, amount and payment reference are checked before an invoice is marked paid. Short or wrong payments are flagged, never counted.",
      class: "lg:col-span-4",
    },
    {
      title: "A receipt anyone can check",
      img: "/images/landing/platform-shield.png",
      text: "Enables real-time, low-cost transactions across borders, so freelancers can get paid faster, no matter where they or their clients are.",
      class: "lg:col-span-3 lg:flex-col-reverse",
    },
  ];

  return (
    <section ref={scope} id="about" className="py-[60px] md:pt-[100px] lg:pb-[200px]">
      <div className="landing-container">
        <h2 data-about-title className="max-md:hidden text-center font-medium text-[32px] lg:text-[48px] leading-[120%]">
          COMPREHENSIVE <br /> INVOICING PLATFORM
        </h2>
        <h2 data-about-title className="text-center font-medium text-2xl md:hidden">
          Comprehensive <br /> Invoicing Platform
        </h2>

        <p data-about-intro className="text-neutral-900 sm:text-black-400 sm:text-2xl tracking-[0.01em] text-center mt-5 max-w-[889px] mx-auto">
          Bridging Web3 innovation with real-world needs across industries like
          agriculture, healthcare, tech, and more. Stellance brings simple
          invoicing and stablecoin payments together, verified on Stellar.
        </p>

        <div className="mt-[30px] md:mt-[60px] grid grid-cols-1 gap-[30px] lg:grid-cols-7 lg:gap-x-5 lg:gap-y-[60px]">
          {aboutDetails.map((d, i) => (
            <AboutCard
              key={i}
              img={d.img}
              text={d.text}
              title={d.title}
              className={d.class}
              imgClassName={d.imgClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
