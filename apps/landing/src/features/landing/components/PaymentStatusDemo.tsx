"use client";

import { useEffect, useState } from "react";
import { Check, Hourglass, ScanSearch } from "lucide-react";

/**
 * The product in one card: an invoice payment going Awaiting → Detected → Verified, on a slow loop.
 * Decorative (aria-hidden). Visitors who prefer reduced motion see the verified state, still.
 */
const STATES = [
  { label: "Awaiting payment", detail: "Waiting for the transaction", icon: Hourglass, tone: "bg-warning-100 text-warning-800" },
  { label: "Payment detected", detail: "Checking amount, asset and memo", icon: ScanSearch, tone: "bg-info-100 text-info-500" },
  { label: "Paid", detail: "Verified on Stellar", icon: Check, tone: "bg-success-50 text-success-600" },
] as const;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PaymentStatusDemo({ className = "" }: { className?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % STATES.length), 2200);
    return () => window.clearInterval(id);
  }, []);

  const state = STATES[step]!;
  const Icon = state.icon;

  return (
    <div
      aria-hidden
      className={`w-64 rounded-[15px] bg-neutral-500 p-4 text-black-500 shadow-2xl shadow-black/30 ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-neutral-900">
        <span>INV-1042</span>
        <span>Stellar Testnet</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-primary-500">100.00 USDC</p>
      <div key={step} className="animate-pop mt-3 flex items-center gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${state.tone}`}>
          <Icon size={18} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold">{state.label}</span>
          <span className="block truncate text-xs text-neutral-900">{state.detail}</span>
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {STATES.map((s, i) => (
          <span
            key={s.label}
            className={`h-1.5 rounded-full transition-colors duration-500 ${i <= step ? "bg-primary-500" : "bg-primary-50"}`}
          />
        ))}
      </div>
    </div>
  );
}
