import clsx from "clsx";
import { Check } from "lucide-react";
import type { PaymentStatus } from "@/features/payments/types";

/**
 * Awaiting → Detected → Verified → Paid. The step being worked on shows a soft scanning bar; an
 * exception (invalid, failed…) stops the line where it happened and colours it.
 */
const STEPS = [
	{ key: "awaiting_payment", label: "Awaiting payment" },
	{ key: "payment_detected", label: "Detected" },
	{ key: "verified", label: "Verified" },
	{ key: "paid", label: "Paid" },
] as const;

const REACHED: Partial<Record<PaymentStatus, number>> = {
	not_started: -1,
	awaiting_payment: 0,
	payment_detected: 1,
	invalid: 1,
	failed: 1,
	unmatched: 1,
	verified: 2,
	paid: 3,
};

export function PaymentTimeline({ status }: { status: PaymentStatus }) {
	const reached = REACHED[status] ?? -1;
	const blocked = status === "invalid" || status === "failed" || status === "unmatched";
	const working = status === "awaiting_payment" || status === "payment_detected" || status === "verified";

	return (
		<ol className="grid grid-cols-4 gap-1.5 sm:gap-2" aria-label="Payment progress">
			{STEPS.map((step, index) => {
				const done = index <= reached;
				const current = index === reached;
				return (
					<li key={step.key} className="min-w-0">
						<div
							className={clsx(
								"relative h-1.5 overflow-hidden rounded-full transition-colors duration-500",
								done ? (blocked && current ? "bg-error-400" : "bg-primary-500") : "bg-primary-50",
							)}
						>
							{current && working && (
								<span className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-white/50 animate-scan" />
							)}
						</div>
						<p
							className={clsx(
								"mt-2 flex items-center gap-1 text-[11px] leading-tight sm:text-xs",
								done ? "font-medium text-primary-500" : "text-neutral-900",
							)}
						>
							{done && !(blocked && current) && <Check size={12} className="hidden shrink-0 sm:block" />}
							<span className="truncate">{blocked && current ? "Not verified" : step.label}</span>
						</p>
					</li>
				);
			})}
		</ol>
	);
}
