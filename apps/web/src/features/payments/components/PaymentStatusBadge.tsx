import clsx from "clsx";
import { PAYMENT_STATUS, TONE_CLASS, VERIFICATION_STATUS } from "@/features/payments/status";
import type { PaymentStatus, VerificationStatus } from "@/features/payments/types";

/** Pill with a dot; the dot pulses while the status is waiting on the network. */
export function PaymentStatusBadge({
	status,
	verification,
	className,
}: {
	status?: PaymentStatus;
	verification?: VerificationStatus;
	className?: string;
}) {
	const meta = verification ? VERIFICATION_STATUS[verification] : status ? PAYMENT_STATUS[status] : null;
	if (!meta) return null;
	const tone = TONE_CLASS[meta.tone];
	const live = !verification && status ? PAYMENT_STATUS[status].live : verification === "detected";

	return (
		<span
			className={clsx(
				"inline-flex h-7 w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium",
				tone.badge,
				className,
			)}
		>
			<span className={clsx("size-1.5 shrink-0 rounded-full", tone.dot, live && "animate-signal")} aria-hidden />
			{meta.label}
		</span>
	);
}
