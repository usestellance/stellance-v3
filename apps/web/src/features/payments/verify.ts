import type {
	CheckKey,
	CheckResult,
	DetectedPayment,
	InvoicePaymentState,
	PaymentExpectation,
	PaymentReason,
	PaymentStatus,
	StellarAsset,
} from "@/features/payments/types";

/**
 * The verification rules, as pure functions so they read like the PRD and can be tested on their own.
 * The API is the authority (it persists results and marks invoices paid); the app runs the same rules
 * on Horizon data so the payment screens work before those endpoints exist.
 */

/** A received payment, as read from the network. */
export interface ObservedPayment {
	id: string;
	hash: string;
	sender: string;
	recipient: string;
	asset: StellarAsset;
	amount: number;
	memo: string | null;
	successful: boolean;
	createdAt: string;
}

/** Amounts are 7-decimal on Stellar; compare in stroops so 0.1 + 0.2 never decides a payment. */
const toStroops = (amount: number) => Math.round(amount * 1e7);

export const sameAsset = (a: StellarAsset, b: StellarAsset) =>
	a.code.toUpperCase() === b.code.toUpperCase() && (a.issuer ?? null) === (b.issuer ?? null);

export const normaliseReference = (value: string | null | undefined) => (value ?? "").trim().toUpperCase();

/**
 * Checks one payment. `references` maps every open invoice's reference to its expectation, so a payment
 * whose memo names no invoice is "unmatched" and never touches an invoice.
 */
export function classifyPayment(
	payment: ObservedPayment,
	references: Map<string, PaymentExpectation>,
): DetectedPayment {
	const memo = payment.memo?.trim() || null;
	const expectation = memo ? references.get(normaliseReference(memo)) : undefined;
	const reasons: PaymentReason[] = [];
	const checks: Record<CheckKey, CheckResult> = {
		recipient: "skip",
		asset: "skip",
		amount: "skip",
		reference: memo ? "pass" : "fail",
		success: payment.successful ? "pass" : "fail",
		invoice: expectation ? "pass" : "fail",
	};

	if (!payment.successful) reasons.push("transaction_failed");

	if (!expectation) {
		reasons.push(memo ? "unknown_reference" : "missing_reference");
		if (memo) checks.reference = "fail";
	} else {
		checks.recipient = payment.recipient === expectation.recipient ? "pass" : "fail";
		checks.asset = sameAsset(payment.asset, expectation.asset) ? "pass" : "fail";
		checks.amount = toStroops(payment.amount) >= toStroops(expectation.amount) ? "pass" : "fail";
		if (checks.recipient === "fail") reasons.push("wrong_recipient");
		if (checks.asset === "fail") reasons.push("wrong_asset");
		if (checks.amount === "fail") reasons.push("insufficient_amount");
	}

	const status = !payment.successful
		? "failed"
		: !expectation
			? "unmatched"
			: reasons.length === 0
				? "verified"
				: "invalid";

	return {
		id: payment.id,
		hash: payment.hash,
		sender: payment.sender,
		recipient: payment.recipient,
		asset: payment.asset,
		amount: payment.amount,
		memo,
		successful: payment.successful,
		detectedAt: payment.createdAt,
		verifiedAt: status === "verified" ? payment.createdAt : null,
		status,
		reasons,
		checks,
		invoiceId: expectation?.invoiceId ?? null,
		invoiceNumber: expectation?.invoiceNumber ?? null,
		expected: expectation
			? {
					amount: expectation.amount,
					asset: expectation.asset,
					recipient: expectation.recipient,
					reference: expectation.reference,
				}
			: null,
	};
}

/**
 * Classifies a batch: one record per operation id (a replayed event is a no-op), oldest first, and a
 * second valid payment for an invoice that is already covered is held for review as a duplicate.
 */
export function classifyPayments(payments: ObservedPayment[], expectations: PaymentExpectation[]): DetectedPayment[] {
	const references = new Map(expectations.map((e) => [normaliseReference(e.reference), e]));
	const unique = new Map(payments.map((p) => [p.id, p]));
	const oldestFirst = [...unique.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
	const settled = new Set<string>();

	const results = oldestFirst.map((payment) => {
		const result = classifyPayment(payment, references);
		if (result.status === "verified" && result.invoiceId) {
			if (settled.has(result.invoiceId)) {
				return { ...result, status: "invalid" as const, reasons: ["duplicate" as const], verifiedAt: null };
			}
			settled.add(result.invoiceId);
		}
		return result;
	});

	return results.reverse();
}

/**
 * The invoice's payment status. `invoiceStatus` is the API's: only the API can say "paid". A verified
 * payment the API hasn't confirmed yet shows as "Payment verified", never as "Paid".
 */
export function invoicePaymentState(
	expectation: PaymentExpectation,
	invoiceStatus: string | undefined,
	payments: DetectedPayment[],
): InvoicePaymentState {
	const attempts = payments.filter((p) => p.invoiceId === expectation.invoiceId);
	const verified = attempts.find((p) => p.status === "verified") ?? null;
	const latest = attempts[0] ?? null;

	let status: PaymentStatus;
	if (invoiceStatus === "paid") status = "paid";
	else if (invoiceStatus === "draft") status = "not_started";
	else if (invoiceStatus === "cancelled") status = "cancelled";
	else if (verified) status = "verified";
	else if (latest?.status === "detected") status = "payment_detected";
	else if (latest?.status === "invalid") status = "invalid";
	else if (latest?.status === "failed") status = "failed";
	else status = "awaiting_payment";

	return { expectation, status, payment: verified ?? latest, attempts };
}

/** A SEP-7 payment link: wallets that support it open a prefilled payment (destination, amount, asset, memo). */
export function paymentUri(expectation: PaymentExpectation) {
	const params = new URLSearchParams({
		destination: expectation.recipient,
		amount: String(expectation.amount),
		asset_code: expectation.asset.code,
		memo: expectation.reference,
		memo_type: "MEMO_TEXT",
		network_passphrase: "Test SDF Network ; September 2015",
	});
	if (expectation.asset.issuer) params.set("asset_issuer", expectation.asset.issuer);
	return `web+stellar:pay?${params.toString()}`;
}
