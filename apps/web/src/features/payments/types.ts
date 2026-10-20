/**
 * Payment detection and verification (Instaward round 2, docs/PLAN.md).
 *
 * An invoice carries an expectation (who must be paid, in what asset, how much, with which reference).
 * Every incoming Stellar payment is checked against it and gets a verification status. The invoice's
 * payment status follows from those results, but "paid" only ever comes from the API.
 */

/** What the invoice page shows. Mirrors the PRD's states, plus draft / cancelled from the invoice itself. */
export type PaymentStatus =
	| "not_started"
	| "awaiting_payment"
	| "payment_detected"
	| "verified"
	| "paid"
	| "invalid"
	| "unmatched"
	| "failed"
	| "expired"
	| "cancelled";

/** One payment's result (PRD "Suggested Verification Status"). */
export type VerificationStatus = "detected" | "verified" | "invalid" | "unmatched" | "failed";

export type PaymentReason =
	| "insufficient_amount"
	| "wrong_asset"
	| "wrong_recipient"
	| "missing_reference"
	| "unknown_reference"
	| "transaction_failed"
	| "duplicate";

export type CheckKey = "recipient" | "asset" | "amount" | "reference" | "success" | "invoice";
export type CheckResult = "pass" | "fail" | "skip";

export interface StellarAsset {
	code: string;
	/** null for XLM (native). */
	issuer: string | null;
}

export interface PaymentExpectation {
	invoiceId: string;
	invoiceNumber: string;
	invoiceUrl?: string;
	recipient: string;
	asset: StellarAsset;
	amount: number;
	/** The memo the payer must include. Today the invoice number (fits a 28-byte text memo). */
	reference: string;
	dueDate?: string;
}

export interface DetectedPayment {
	/** Stellar operation id: unique per payment, so the same payment is never counted twice. */
	id: string;
	hash: string;
	sender: string;
	recipient: string;
	asset: StellarAsset;
	amount: number;
	memo: string | null;
	successful: boolean;
	detectedAt: string;
	/** When the checks ran (the API sets this; client-side checks run on read). */
	verifiedAt: string | null;
	status: VerificationStatus;
	reasons: PaymentReason[];
	checks: Record<CheckKey, CheckResult>;
	invoiceId: string | null;
	invoiceNumber: string | null;
	expected: Pick<PaymentExpectation, "amount" | "asset" | "recipient" | "reference"> | null;
}

export interface InvoicePaymentState {
	expectation: PaymentExpectation;
	status: PaymentStatus;
	/** The payment that settles (or blocks) the invoice: the verified one, else the latest attempt. */
	payment: DetectedPayment | null;
	attempts: DetectedPayment[];
}
