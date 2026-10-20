"use client";
import React, { useRef } from "react";
import { FileText, Link2, ScanSearch, ShieldCheck, Wallet } from "lucide-react";
import { gsap, revealOnScroll, revealWords, useMotion } from "@/features/landing/motion";

const STEPS = [
  {
    icon: FileText,
    title: "Create an invoice",
    text: "Choose a template, add your items, and Stellance sets the amount, the USDC asset, your wallet and a unique payment reference.",
  },
  {
    icon: Link2,
    title: "Share the payment request",
    text: "Send it by email. Your client gets a payment page with a QR code, the exact amount and the memo to include.",
  },
  {
    icon: Wallet,
    title: "Your client pays in USDC",
    text: "From any Stellar wallet, anywhere in the world. The payment settles on the network in about five seconds.",
  },
  {
    icon: ScanSearch,
    title: "Detected and verified",
    text: "Stellance picks the payment up and checks recipient, asset, amount and reference. Partial or wrong payments are flagged for review.",
  },
  {
    icon: ShieldCheck,
    title: "Marked paid, with proof",
    text: "Only a verified payment marks the invoice paid, with the transaction hash and an explorer link as your receipt.",
  },
];

/** The payment lifecycle, step by step. The progress line draws as you scroll through it. */
const HowItWorks = () => {
  const scope = useRef<HTMLElement>(null);

  useMotion(scope, ({ isDesktop }) => {
    const root = scope.current!;
    revealWords(root.querySelector("[data-how-title]"), { scrollTrigger: { trigger: root, start: "top 75%", once: true } });
    revealOnScroll("[data-how-intro]", root.querySelector("[data-how-intro]"));

    const steps = gsap.utils.toArray<HTMLElement>("[data-how-step]");
    gsap.from("[data-how-line]", {
      [isDesktop ? "scaleX" : "scaleY"]: 0,
      ease: "none",
      scrollTrigger: { trigger: "[data-how-list]", start: "top 70%", end: "bottom 60%", scrub: 0.5 },
    });
    steps.forEach((step) => {
      gsap.from(step, { y: 24, opacity: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: step, start: "top 85%", once: true } });
      // Each step's marker turns solid as the line reaches it.
      gsap.fromTo(
        step.querySelector("[data-how-dot]"),
        { backgroundColor: "#d9e4f8", color: "#000c3b" },
        { backgroundColor: "#000c3b", color: "#ffffff", duration: 0.4, scrollTrigger: { trigger: step, start: "top 65%", toggleActions: "play none none reverse" } },
      );
    });
  });

  return (
    <section ref={scope} id="how-it-works" className="py-[60px] md:py-24 lg:py-40 bg-primary-20">
      <div className="landing-container">
        <h2 data-how-title className="text-2xl text-center font-bold md:text-[32px]">
          HOW IT WORKS
        </h2>
        <p data-how-intro className="text-center text-neutral-900 mt-5 max-w-2xl mx-auto md:text-2xl md:text-black-400">
          From invoice to verified payment, without chasing screenshots or
          checking bank statements.
        </p>

        <ol data-how-list className="relative mt-14 grid gap-10 lg:mt-20 lg:grid-cols-5 lg:gap-6">
          <span
            data-how-line
            aria-hidden
            className="absolute left-[23px] top-6 bottom-6 w-0.5 origin-top bg-primary-500 lg:left-[10%] lg:right-[10%] lg:top-6 lg:bottom-auto lg:h-0.5 lg:w-auto lg:origin-left"
          />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} data-how-step className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center">
              <span
                data-how-dot
                className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500 ring-8 ring-primary-20"
              >
                <Icon size={22} />
              </span>
              <div>
                <p className="text-xs font-bold text-neutral-900">STEP {i + 1}</p>
                <h3 className="mt-1 font-bold text-lg lg:text-xl">{title}</h3>
                <p className="mt-2 text-sm text-neutral-900 lg:text-base">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
