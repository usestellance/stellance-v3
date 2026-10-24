import type { DetectedPayment, PaymentExpectation, PaymentReason, PaymentStatus, VerificationStatus } from "@/features/payments/types";

/**
 * Every payment label, colour and sentence lives here, so the badge on a list row, the state card and
 * the customer's payment page always agree. Components never decide these themselves.
 */

export type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "muted";

export const TONE_CLASS: Record<Tone, { badge: string; dot: string; icon: string }> = {
	neutral: { badge: "bg-primary-50 text-primary-500", dot: "bg-primary-500", icon: "bg-primary-50 text-primary-500" },
	info: { badge: "bg-info-100 text-info-500", dot: "bg-info-500", icon: "bg-info-100 text-info-500" },
	warning: { badge: "bg-warning-100 text-warning-800", dot: "bg-warning-600", icon: "bg-warning-100 text-warning-700" },
	success: { badge: "bg-success-50 text-success-600", dot: "bg-success-500", icon: "bg-success-50 text-success-500" },
	danger: { badge: "bg-error-50 text-error-500", dot: "bg-error-400", icon: "bg-error-50 text-error-400" },
	muted: { badge: "bg-neutral-600 text-neutral-900", dot: "bg-neutral-900", icon: "bg-neutral-600 text-neutral-900" },
};

export interface StatusMeta {
	label: string;
	title: string;
	description: string;
	tone: Tone;
	/** Waiting on the network: the badge dot pulses. */
	live?: boolean;
	/** Nothing more will happen without someone acting. */
	final?: boolean;
}

export const PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
	not_started: {
		label: "Not started",
		title: "Not sent yet",
		description: "Send the invoice to start accepting payment.",
		tone: "muted",
	},
	awaiting_payment: {
		label: "Awaiting payment",
		title: "Awaiting payment",
		description: "No relevant transaction has been detected yet.",
		tone: "warning",
		live: true,
	},
	payment_detected: {
		label: "Payment detected",
		title: "Payment detected",
		description: "Transaction found. Verifying the details…",
		tone: "info",
		live: true,
	},
	verified: {
		label: "Verified",
		title: "Payment verified",
		description: "The transaction meets every requirement of this invoice. Final confirmation is on its way.",
		tone: "success",
		live: true,
	},
	paid: {
		label: "Paid",
		title: "Payment successful",
		description: "Payment verified and matched to this invoice.",
		tone: "success",
		final: true,
	},
	invalid: {
		label: "Invalid",
		title: "Invalid payment",
		description: "A payment was found, but it does not meet this invoice's requirements. The invoice stays unpaid.",
		tone: "danger",
	},
	unmatched: {
		label: "Unmatched",
		title: "Unmatched transaction",
		description: "A transaction was detected, but no invoice matches it.",
		tone: "warning",
	},
	failed: {
		label: "Failed",
		title: "Failed transaction",
		description: "The transaction failed on Stellar. No funds moved and the invoice stays unpaid.",
		tone: "danger",
	},
	expired: {
		label: "Expired",
		title: "Expired invoice",
		description: "The payment window for this invoice has closed.",
		tone: "muted",
		final: true,
	},
	cancelled: {
		label: "Cancelled",
		title: "Invoice cancelled",
		description: "This invoice no longer accepts payment.",
		tone: "muted",
		final: true,
	},
};

export const VERIFICATION_STATUS: Record<VerificationStatus, { label: string; tone: Tone }> = {
	detected: { label: "Verifying", tone: "info" },
	verified: { label: "Verified", tone: "success" },
	invalid: { label: "Invalid", tone: "danger" },
	unmatched: { label: "Unmatched", tone: "warning" },
	failed: { label: "Failed", tone: "danger" },
};

/** The invoice status a payment's verification result implies (state cards, payment detail headers). */
export const VERIFICATION_TO_PAYMENT: Record<VerificationStatus, PaymentStatus> = {
	detected: "payment_detected",
	verified: "verified",
	invalid: "invalid",
	unmatched: "unmatched",
	failed: "failed",
};

const asset = (code: string) => (code === "XLM" ? "XLM" : code);

/**
 * A short headline and a sentence for each reason a payment did not verify. `expected` is the invoice's
 * payment request when the screen has it; otherwise the API's own sentence explains the mismatch.
 */
export function reasonCopy(
	reason: PaymentReason,
	payment: DetectedPayment,
	expected?: Pick<PaymentExpectation, "amount" | "asset"> | null,
): { title: string; detail: string } {
	switch (reason) {
		case "insufficient_amount":
			return {
				title: "Amount mismatch",
				detail: expected
					? `Expected ${formatAmount(expected.amount)} ${asset(expected.asset.code)}; received ${formatAmount(payment.amount)} ${asset(payment.asset.code)}.`
					: `Received ${formatAmount(payment.amount)} ${asset(payment.asset.code)}, less than the invoice asks for.`,
			};
		case "wrong_asset":
			return {
				title: "Wrong asset",
				detail: `Expected ${expected?.asset.code ?? "USDC"} from the Testnet issuer; received ${payment.asset.code}${payment.asset.issuer ? " from another issuer" : ""}.`,
			};
		case "wrong_recipient":
			return { title: "Wrong recipient", detail: "The payment was sent to a different wallet than the invoice's." };
		case "missing_reference":
			return { title: "No payment reference", detail: "The transaction has no memo, so it can't be linked to an invoice." };
		case "unknown_reference":
			return { title: "Reference not found", detail: `No invoice uses the reference “${payment.memo}”.` };
		case "transaction_failed":
			return { title: "Transaction failed", detail: "The transaction failed on Stellar, so no funds moved." };
		case "duplicate":
			return { title: "Already paid", detail: "This invoice was already settled by an earlier payment. Review and refund if needed." };
	}
}

export function formatAmount(amount: number) {
	return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 }).format(amount);
}

export function formatDateTime(value: string | null | undefined) {
	if (!value) return "—";
	return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(
		new Date(value),
	);
}
