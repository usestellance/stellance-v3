import Cookies from "js-cookie";
import { axiosAuth, axiosInstance } from "@/lib/api/client";
import type { InvoiceType } from "@/features/invoice/types";
import type {
	CheckKey,
	CheckResult,
	DetectedPayment,
	InvoicePaymentState,
	PaymentExpectation,
	PaymentReason,
	PaymentStatus,
	StellarAsset,
	VerificationStatus,
} from "@/features/payments/types";

/**
 * The one seam between the payment screens and the API's payment endpoints (live, or the mock in
 * `@repo/mock-api`, which serves the same shapes):
 *
 *   GET  /payments/request/{invoice_url}  public: an invoice's payment request (the customer's page)
 *   GET  /payments/invoice/{id}           merchant: the same, plus every payment attempt
 *   GET  /payments?status&page&limit      merchant: payments received to their wallets ({ payments, meta })
 *   GET  /payments/{id}                   merchant: one of those payments
 *   POST /payments/verify                 merchant: re-check a transaction hash
 */

interface PaymentRecordDto {
	id: string;
	invoice_id?: string | null;
	transaction_hash: string;
	explorer_url?: string | null;
	sender: string;
	recipient: string;
	invoice_number?: string | null;
	asset_code?: string;
	asset_issuer?: string | null;
	/** Before 2026-10-24: "CODE:ISSUER", or "XLM" / "native". */
	asset?: string;
	amount: string | number;
	payment_reference?: string | null;
	verification_status: string;
	failure_code?: string | null;
	failure_reason?: string | null;
	checks?: Partial<Record<CheckKey, CheckResult>> | null;
	ledger_closed_at?: string;
	detected_at: string;
	verified_at?: string | null;
}

interface PaymentRequestDto {
	invoice_id: string;
	invoice_number: string;
	invoice_status: string;
	payment_status: string;
	amount: string | number;
	asset_code?: string;
	asset_issuer?: string | null;
	/** Before 2026-10-24. */
	asset?: string;
	recipient: string;
	payment_reference: string;
	network: string;
	expires_at: string | null;
	payment_detected_at?: string | null;
	verification_status?: string | null;
	verified_at?: string | null;
	paid_at?: string | null;
	transaction_hash?: string | null;
	explorer_url?: string | null;
	payments?: PaymentRecordDto[] | null;
}

/** "USDC:G…" | "XLM" | "native" → { code, issuer }. */
export function parseAsset(asset: string, issuer?: string | null): StellarAsset {
	if (!asset || asset === "native" || asset === "XLM") return { code: "XLM", issuer: null };
	const [code, fromString] = asset.split(":");
	return { code: code ?? asset, issuer: fromString ?? issuer ?? null };
}

/** The asset of a record or request: `asset_code` + `asset_issuer`, or the older combined `asset`. */
function assetOf(dto: { asset_code?: string; asset_issuer?: string | null; asset?: string }): StellarAsset {
	if (dto.asset_code) return dto.asset_code === "XLM" || dto.asset_code === "native" ? { code: "XLM", issuer: null } : { code: dto.asset_code, issuer: dto.asset_issuer ?? null };
	return parseAsset(dto.asset ?? "", dto.asset_issuer);
}

const VERIFICATION: Record<string, VerificationStatus> = {
	pending: "detected",
	detected: "detected",
	verified: "verified",
	invalid: "invalid",
	unmatched: "unmatched",
	failed: "failed",
};

const REASONS = new Set<string>(["insufficient_amount", "wrong_asset", "wrong_recipient", "missing_reference", "unknown_reference", "transaction_failed", "duplicate"]);

/**
 * Why a payment did not settle: the API's `failure_code`, or (older records, unknown codes) its known
 * phrasings of `failure_reason`.
 */
export function reasonsFrom(status: VerificationStatus, failure: string | null | undefined, code?: string | null): PaymentReason[] {
	if (code && REASONS.has(code)) return [code as PaymentReason];
	const text = (failure ?? "").toLowerCase();
	const reasons: PaymentReason[] = [];
	if (status === "failed" || text.includes("transaction failed")) reasons.push("transaction_failed");
	if (text.includes("insufficient")) reasons.push("insufficient_amount");
	if (text.includes("expected asset") || text.includes("wrong asset")) reasons.push("wrong_asset");
	if (text.includes("recipient")) reasons.push("wrong_recipient");
	if (text.includes("no text memo") || text.includes("no memo") || text.includes("missing reference")) reasons.push("missing_reference");
	if (text.includes("no invoice matches") || text.includes("unknown reference")) reasons.push("unknown_reference");
	if (text.includes("already paid") || text.includes("duplicate")) reasons.push("duplicate");
	return reasons;
}

function checksFrom(status: VerificationStatus, reasons: PaymentReason[]): Record<CheckKey, CheckResult> {
	if (status === "verified") return { recipient: "pass", asset: "pass", amount: "pass", reference: "pass", success: "pass", invoice: "pass" };
	if (status === "detected") return { recipient: "skip", asset: "skip", amount: "skip", reference: "skip", success: "skip", invoice: "skip" };
	const has = (r: PaymentReason) => reasons.includes(r);
	const noInvoice = has("missing_reference") || has("unknown_reference");
	const known = reasons.length > 0;
	return {
		success: has("transaction_failed") ? "fail" : "pass",
		reference: noInvoice ? "fail" : known ? "pass" : "skip",
		invoice: noInvoice || has("duplicate") ? "fail" : known ? "pass" : "skip",
		recipient: has("wrong_recipient") ? "fail" : noInvoice || !known ? "skip" : "pass",
		asset: has("wrong_asset") ? "fail" : noInvoice || !known ? "skip" : "pass",
		amount: has("insufficient_amount") ? "fail" : noInvoice || has("wrong_asset") || !known ? "skip" : "pass",
	};
}

export function fromRecord(dto: PaymentRecordDto): DetectedPayment {
	const status = VERIFICATION[dto.verification_status] ?? "detected";
	const reasons = reasonsFrom(status, dto.failure_reason, dto.failure_code);
	return {
		id: dto.id,
		hash: dto.transaction_hash,
		explorerUrl: dto.explorer_url ?? null,
		sender: dto.sender,
		recipient: dto.recipient,
		asset: assetOf(dto),
		amount: Number(dto.amount),
		memo: dto.payment_reference ?? null,
		detectedAt: dto.detected_at,
		verifiedAt: dto.verified_at ?? null,
		status,
		failureReason: dto.failure_reason ?? null,
		reasons,
		checks: { ...checksFrom(status, reasons), ...(dto.checks ?? {}) },
		invoiceId: dto.invoice_id ?? null,
	};
}

const PAYMENT_STATUS: Record<string, PaymentStatus> = {
	awaiting_payment: "awaiting_payment",
	payment_detected: "payment_detected",
	detected: "payment_detected",
	verified: "verified",
	paid: "paid",
	invalid_payment: "invalid",
	invalid: "invalid",
	failed: "failed",
	expired: "expired",
	cancelled: "cancelled",
	draft: "not_started",
};

/** The request as the app's state: requirements, status, attempts and the payment that decides it. */
function stateFrom(dto: PaymentRequestDto): InvoicePaymentState {
	const expectation: PaymentExpectation = {
		invoiceId: dto.invoice_id,
		invoiceNumber: dto.invoice_number,
		recipient: dto.recipient,
		asset: assetOf(dto),
		amount: Number(dto.amount),
		reference: dto.payment_reference,
		expiresAt: dto.expires_at,
	};
	const attempts = (dto.payments ?? []).map(fromRecord).sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
	let payment = attempts.find((p) => p.status === "verified") ?? attempts[0] ?? null;
	// The public request carries only the deciding transaction, without the attempt list.
	if (!payment && dto.transaction_hash) {
		const status = VERIFICATION[dto.verification_status ?? ""] ?? "verified";
		payment = {
			id: dto.transaction_hash,
			hash: dto.transaction_hash,
			explorerUrl: dto.explorer_url ?? null,
			sender: "",
			recipient: dto.recipient,
			asset: expectation.asset,
			amount: expectation.amount,
			memo: dto.payment_reference,
			detectedAt: dto.payment_detected_at ?? dto.verified_at ?? "",
			verifiedAt: dto.verified_at ?? null,
			status,
			failureReason: null,
			reasons: [],
			checks: checksFrom(status, []),
			invoiceId: dto.invoice_id,
		};
	}
	let status = PAYMENT_STATUS[dto.payment_status] ?? PAYMENT_STATUS[dto.invoice_status] ?? "awaiting_payment";
	if (status === "invalid" && (dto.verification_status === "failed" || payment?.status === "failed")) status = "failed";
	return { expectation, status, payment, attempts };
}

/** The payment status an invoice row shows, from the invoice's own status (no extra request). */
export function paymentStatusOf(invoice: Pick<InvoiceType, "status">): PaymentStatus {
	switch (invoice.status) {
		case "paid":
			return "paid";
		case "draft":
			return "not_started";
		case "cancelled":
			return "cancelled";
		case "expired":
			return "expired";
		case "invalid_payment":
			return "invalid";
		default:
			return "awaiting_payment";
	}
}

/** The session token (these calls run outside components, so the useAxiosAuth interceptor may not be mounted). */
const authHeaders = () => ({ Authorization: `Bearer ${Cookies.get("access_token") ?? ""}` });

export async function getPaymentRequest(invoiceUrl: string): Promise<InvoicePaymentState> {
	const { data } = await axiosInstance.get(`/payments/request/${encodeURIComponent(invoiceUrl)}`);
	return stateFrom(data.data as PaymentRequestDto);
}

export async function getInvoicePayment(invoiceId: string): Promise<InvoicePaymentState> {
	const { data } = await axiosAuth.get(`/payments/invoice/${invoiceId}`, { headers: authHeaders() });
	return stateFrom(data.data as PaymentRequestDto);
}

export async function listPayments(status?: VerificationStatus): Promise<DetectedPayment[]> {
	const query = new URLSearchParams({ page: "1", limit: "100" });
	if (status) query.set("status", status);
	const { data } = await axiosAuth.get(`/payments?${query}`, { headers: authHeaders() });
	const list = (Array.isArray(data.data) ? data.data : (data.data?.payments ?? [])) as PaymentRecordDto[];
	return list.map(fromRecord);
}

export async function getPayment(id: string): Promise<DetectedPayment> {
	const { data } = await axiosAuth.get(`/payments/${encodeURIComponent(id)}`, { headers: authHeaders() });
	return fromRecord(data.data as PaymentRecordDto);
}

/** Ask the API to check a transaction against the merchant's invoices again (e.g. after a network hiccup). */
export async function verifyTransaction(hash: string): Promise<DetectedPayment[]> {
	const { data } = await axiosAuth.post("/payments/verify", { transaction_hash: hash.trim() }, { headers: authHeaders() });
	return ((Array.isArray(data.data) ? data.data : [data.data]).filter(Boolean) as PaymentRecordDto[]).map(fromRecord);
}

export type SimulationScenario = "correct" | "insufficient" | "wrong_asset" | "no_memo" | "unknown_memo" | "failed" | "duplicate";

/** Demo data only: pretend a customer just paid this invoice on Testnet. */
export async function simulatePayment(invoiceId: string, scenario: SimulationScenario) {
	const { data } = await axiosInstance.post("/mock/payments/simulate", { invoice_id: invoiceId, scenario });
	return data;
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
