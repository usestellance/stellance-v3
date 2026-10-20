import Cookies from "js-cookie";
import { axiosAuth, axiosInstance } from "@/lib/api/client";
import { USE_MOCK_API } from "@/lib/api/source";
import type { InvoiceType } from "@/features/invoice/types";
import type { DetectedPayment, PaymentExpectation } from "@/features/payments/types";
import { USDC } from "@/lib/stellar/config";

/**
 * The one seam between the payment screens and their data.
 *
 * - "api": the backend's detection results, the contract proposed in docs/PLAN.md. The mock backend
 *   serves it, so this is the default with demo data.
 * - "horizon": the app reads Testnet directly and runs the verification rules in `verify.ts`.
 *   Read-only; it never marks anything paid. The default against the live API until it ships detection.
 * `NEXT_PUBLIC_PAYMENTS_SOURCE` overrides either.
 */
const CONFIGURED = process.env.NEXT_PUBLIC_PAYMENTS_SOURCE;
export const PAYMENTS_SOURCE: "horizon" | "api" =
	CONFIGURED === "api" || CONFIGURED === "horizon" ? CONFIGURED : USE_MOCK_API ? "api" : "horizon";

/** The invoice's payment requirements. Falls back to today's fields until the API returns its own. */
export function expectationFor(invoice: InvoiceType | undefined, recipient?: string): PaymentExpectation | null {
	const to = invoice?.payment_recipient ?? recipient ?? invoice?.createdBy?.wallet_address;
	if (!invoice?.id || !invoice.invoice_number || !to) return null;
	return {
		invoiceId: invoice.id,
		invoiceNumber: invoice.invoice_number,
		invoiceUrl: invoice.invoice_url,
		recipient: to,
		asset: { code: invoice.payment_asset_code ?? USDC.code, issuer: invoice.payment_asset_issuer ?? USDC.issuer },
		amount: Number(invoice.payment_amount ?? invoice.total ?? 0),
		reference: invoice.payment_reference ?? invoice.invoice_number,
		dueDate: invoice.payment_expires_at ?? invoice.due_date,
	};
}

/** The API's payment record (docs/PLAN.md, D2). */
interface PaymentDto {
	id: string;
	transaction_hash: string;
	sender: string;
	recipient: string;
	asset_code: string;
	asset_issuer: string | null;
	amount: string | number;
	payment_reference: string | null;
	transaction_successful: boolean;
	verification_status: DetectedPayment["status"];
	reasons?: DetectedPayment["reasons"];
	checks?: DetectedPayment["checks"];
	invoice_id: string | null;
	invoice_number: string | null;
	expected?: { amount: number; asset_code: string; asset_issuer: string | null; recipient: string; payment_reference: string } | null;
	detected_at: string;
	verified_at: string | null;
}

function fromDto(dto: PaymentDto): DetectedPayment {
	return {
		id: dto.id,
		hash: dto.transaction_hash,
		sender: dto.sender,
		recipient: dto.recipient,
		asset: { code: dto.asset_code, issuer: dto.asset_issuer },
		amount: Number(dto.amount),
		memo: dto.payment_reference,
		successful: dto.transaction_successful,
		detectedAt: dto.detected_at,
		verifiedAt: dto.verified_at,
		status: dto.verification_status,
		reasons: dto.reasons ?? [],
		checks: dto.checks ?? { recipient: "skip", asset: "skip", amount: "skip", reference: "skip", success: "skip", invoice: "skip" },
		invoiceId: dto.invoice_id,
		invoiceNumber: dto.invoice_number,
		expected: dto.expected
			? {
					amount: dto.expected.amount,
					asset: { code: dto.expected.asset_code, issuer: dto.expected.asset_issuer },
					recipient: dto.expected.recipient,
					reference: dto.expected.payment_reference,
				}
			: null,
	};
}

/** The session token (these calls run outside components, so the useAxiosAuth interceptor may not be mounted). */
const authHeaders = () => ({ Authorization: `Bearer ${Cookies.get("access_token") ?? ""}` });

export async function listInvoicePayments(invoiceId: string): Promise<DetectedPayment[]> {
	// Public, like the customer's payment page that shows it.
	const { data } = await axiosInstance.get(`/invoice/${invoiceId}/payments`);
	return (data.data as PaymentDto[]).map(fromDto);
}

export async function listPayments(): Promise<DetectedPayment[]> {
	const { data } = await axiosAuth.get(`/payment?page=1&size=100`, { headers: authHeaders() });
	return ((data.data?.payments ?? data.data) as PaymentDto[]).map(fromDto);
}

export async function getPayment(id: string): Promise<DetectedPayment> {
	const { data } = await axiosAuth.get(`/payment/${id}`, { headers: authHeaders() });
	return fromDto(data.data as PaymentDto);
}

export type SimulationScenario = "correct" | "insufficient" | "wrong_asset" | "no_memo" | "unknown_memo" | "failed" | "duplicate";

/** Demo data only: pretend a customer just paid this invoice on Testnet. */
export async function simulatePayment(invoiceId: string, scenario: SimulationScenario) {
	const { data } = await axiosInstance.post("/mock/payments/simulate", { invoice_id: invoiceId, scenario });
	return data;
}
