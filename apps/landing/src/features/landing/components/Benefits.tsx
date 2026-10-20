"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, revealOnScroll, useMotion } from "@/features/landing/motion";

const BENEFITS = {
  client: [
    ["Pay in seconds", "Settle invoices from any Stellar wallet, without slow international bank transfers."],
    ["Lower fees", "Pay a fraction of what traditional cross-border payments cost."],
    ["Simple checkout", "Scan a QR code or open your wallet with the amount and memo already filled in."],
    ["Clear confirmation", "See when your payment is detected and verified, with a transaction link as proof."],
    ["Pay from anywhere", "No specific bank or payment provider needed, wherever you are."],
  ],
  business: [
    ["Know when you’re paid", "Payments are detected and checked against the invoice automatically."],
    ["No reconciliation guesswork", "Each payment is matched to its invoice by reference; mismatches are flagged, not counted."],
    ["Faster cash flow", "No more waiting 3–5 business days for international wires."],
    ["Global reach", "Serve clients anywhere in the world without banking limitations."],
    ["Records you can trust", "Every paid invoice links to its on-chain transaction, ready for your accounts."],
  ],
} as const;

const Benefits = () => {
  const [activeTab, setActiveTab] = useState<"client" | "business">("client");
  const scope = useRef<HTMLElement>(null);

  useMotion(scope, ({ isDesktop }) => {
    const root = scope.current!;
    revealOnScroll("[data-benefits-panel]", root, { y: 40 });
    if (isDesktop) {
      gsap.from("[data-benefits-phone]", { y: 60, opacity: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: root, start: "top 75%", once: true } });
    }
  });

  return (
    <section ref={scope} id="solutions" className="bg-primary-500 overflow-hidden ">
      <div className=" max-w-6xl mx-auto md:flex relative px-4 sm:px-8 lg:px-10">
        <div data-benefits-phone className="max-md:hidden h-[400px] lg:h-[500px] absolute left-0 lg:left-10 -bottom-1">
          <Image
            src="/images/phone_hand.png"
            alt=""
            width={500}
            loading="lazy"
            height={500}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="max-md:hidden w-1/2"></div>
        <div className="md:w-2/3 xl:w-4/5 py-[30px] md:py-[60px] lg:py-[106px]">
          <div
            role="tablist"
            aria-label="Benefits for"
            className="flex justify-center md:justify-start text-neutral-500 text-sm sm:text-base  gap-6 max-[300px]:flex-wrap"
          >
            {(["client", "business"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`py-[9.5px] w-full max-w-[150px] text-center rounded-[30px] px-2 font-bold  ${activeTab === tab ? "bg-neutral-500 text-primary-500" : "bg-[#d0dff2]/20"} cursor-pointer duration-150`}
              >
                {tab === "client" ? "For Clients" : "For Businesses"}
              </button>
            ))}
          </div>
          <div
            data-benefits-panel
            role="tabpanel"
            className="bg-neutral-500 mt-[30px] rounded-[15px] p-[30px] w-full max-md:max-w-sm max-md:mx-auto lg:max-w-xl"
          >
            <h3 className="text-2xl font-bold">KEY BENEFITS</h3>
            {/* Keyed by tab so the list replays its short entrance on each switch. */}
            <ul key={activeTab} className="list-disc mt-4 ml-4 space-y-1">
              {BENEFITS[activeTab].map(([title, text], i) => (
                <li key={title} className="animate-rise" style={{ "--i": i } as React.CSSProperties}>
                  <strong>{title}:</strong> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
