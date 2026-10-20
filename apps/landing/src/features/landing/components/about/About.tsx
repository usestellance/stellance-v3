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
      img: "/images/about-img-1.png",
      text: "Pick a template, add your items and send it by email. Your client can review it, leave comments and approve it before paying.",
      class: "md:flex-col-reverse md:col-span-3",
    },
    {
      title: "Paid in USDC on Stellar",
      img: "/images/about-img-2.png",
      text: "Clients pay from any Stellar wallet with a QR code or payment link. Funds settle in seconds, for a fraction of a cent.",
      class: "md:col-span-4",
    },
    {
      title: "Every payment verified",
      img: "/images/about-img-3.png",
      text: "Recipient, asset, amount and payment reference are checked before an invoice is marked paid. Short or wrong payments are flagged, never counted.",
      class: "md:col-span-4",
    },
    {
      title: "A receipt anyone can check",
      img: "/images/about-img-4.png",
      text: "Each paid invoice links to its Stellar transaction, so you and your client can confirm it on a public explorer.",
      class: "md:col-span-3 md:flex-col-reverse",
    },
  ];

  return (
    <section ref={scope} id="about" className="py-[60px] md:pt-[100px] lg:pb-[200px]">
      <div className="landing-container">
        <h2 data-about-title className="max-md:hidden text-center font-medium text-[32px]">
          COMPREHENSIVE <br /> INVOICING PLATFORM
        </h2>
        <h2 data-about-title className="text-center font-medium text-2xl md:hidden">
          Comprehensive <br /> Invoicing Platform
        </h2>

        <p data-about-intro className="text-neutral-900 sm:text-black-400 sm:text-2xl text-center mt-5 lg:w-2/3 mx-auto">
          Stellance brings invoicing and stablecoin payments together, so
          getting paid across borders works like sending an email.
          <br />
          <br />
          Built for freelancers with international clients, remote teams and
          agencies, SMEs in cross-border trade, Web3 builders, and African
          businesses serving global markets.
        </p>

        <div className="mt-[30px] md:mt-[60px] grid grid-cols-1 gap-[30px] md:grid-cols-7 md:gap-x-5 md:gap-y-[60px]">
          {aboutDetails.map((d, i) => (
            <AboutCard
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

export default About;
