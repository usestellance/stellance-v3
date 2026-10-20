import clsx from "clsx";
import { Ban, CircleAlert, CircleX, Clock3, FileClock, Hourglass, ScanSearch, ShieldCheck } from "lucide-react";
import { PAYMENT_STATUS, TONE_CLASS } from "@/features/payments/status";
import type { PaymentStatus } from "@/features/payments/types";

/** The round icon used on state cards and payment headers. "Paid" draws its check once. */
export function StatusIcon({ status, size = "md" }: { status: PaymentStatus; size?: "sm" | "md" | "lg" }) {
	const meta = PAYMENT_STATUS[status];
	const box = size === "lg" ? "size-16" : size === "sm" ? "size-9" : "size-12";
	const icon = size === "lg" ? 30 : size === "sm" ? 18 : 22;

	return (
		<span
			className={clsx(
				"inline-flex shrink-0 items-center justify-center rounded-full",
				box,
				TONE_CLASS[meta.tone].icon,
				meta.live && "animate-signal",
			)}
			aria-hidden
		>
			{status === "paid" ? (
				<svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
					<path d="M5 12.5l4.5 4.5L19 7.5" className="animate-check" />
				</svg>
			) : (
				<Glyph status={status} size={icon} />
			)}
		</span>
	);
}

function Glyph({ status, size }: { status: PaymentStatus; size: number }) {
	switch (status) {
		case "awaiting_payment":
			return <Hourglass size={size} />;
		case "payment_detected":
			return <ScanSearch size={size} />;
		case "verified":
			return <ShieldCheck size={size} />;
		case "invalid":
			return <CircleX size={size} />;
		case "unmatched":
			return <CircleAlert size={size} />;
		case "failed":
			return <CircleX size={size} />;
		case "expired":
			return <Clock3 size={size} />;
		case "cancelled":
			return <Ban size={size} />;
		default:
			return <FileClock size={size} />;
	}
}
