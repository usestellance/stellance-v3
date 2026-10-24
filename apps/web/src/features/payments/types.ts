/**
 * Payment detection and verification (Instaward round 2, docs/PLAN.md).
 *
 * The API owns all of it: it gives every invoice a payment request (recipient, asset, amount, reference),
 * watches Stellar Testnet, checks each incoming payment and marks the invoice paid. These are the app's
 * shapes for what it returns; `api.ts` maps the wire format onto them.
 */

/** What an invoice's payment screens show. Follows the API's `payment_status`, plus a draft's "not started". */
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
	| "cancelled"
	| "refunded";

/** One payment's verdict (the API's `verification_status`). */
export type VerificationStatus = "detected" | "verified" | "invalid" | "unmatched" | "failed";

/** Why a payment did not settle, read from the API's `failure_reason`. */
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

/** An invoice's payment request: what the payer must send, and where it stands. */
export interface PaymentExpectation {
	invoiceId: string;
	invoiceNumber: string;
	recipient: string;
	asset: StellarAsset;
	amount: number;
	/** The memo the payer must include: the API's `payment_reference` (`STL-…`). */
	reference: string;
	expiresAt: string | null;
}

export interface DetectedPayment {
	id: string;
	hash: string;
	explorerUrl: string | null;
	sender: string;
	recipient: string;
	asset: StellarAsset;
	amount: number;
	memo: string | null;
	detectedAt: string;
	verifiedAt: string | null;
	status: VerificationStatus;
	/** The API's own words for why it did not settle. */
	failureReason: string | null;
	reasons: PaymentReason[];
	checks: Record<CheckKey, CheckResult>;
	invoiceId: string | null;
}

export interface InvoicePaymentState {
	expectation: PaymentExpectation;
	status: PaymentStatus;
	/** The payment that settles (or blocks) the invoice: the verified one, else the latest attempt. */
	payment: DetectedPayment | null;
	attempts: DetectedPayment[];
}
