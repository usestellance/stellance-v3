import type { ObservedPayment } from "@/features/payments/verify";
import { HORIZON_URL } from "@/lib/stellar/config";

/**
 * Read-only access to Stellar Testnet (Horizon). Only payments *into* the account are returned:
 * plain payments and path payments (the received asset and amount), failed transactions included,
 * so a failed payment can be shown as failed instead of disappearing.
 */

const PAYMENT_TYPES = new Set(["payment", "path_payment_strict_receive", "path_payment_strict_send"]);

interface HorizonPaymentRecord {
	id: string;
	type: string;
	from?: string;
	to?: string;
	asset_type?: string;
	asset_code?: string;
	asset_issuer?: string;
	amount?: string;
	transaction_hash: string;
	transaction_successful: boolean;
	created_at: string;
	transaction?: { memo?: string; memo_type?: string; successful?: boolean };
}

function toObserved(record: HorizonPaymentRecord): ObservedPayment {
	const native = record.asset_type === "native";
	return {
		id: record.id,
		hash: record.transaction_hash,
		sender: record.from ?? "",
		recipient: record.to ?? "",
		asset: { code: native ? "XLM" : (record.asset_code ?? ""), issuer: native ? null : (record.asset_issuer ?? null) },
		amount: Number(record.amount ?? 0),
		memo: record.transaction?.memo_type === "text" ? (record.transaction.memo ?? null) : (record.transaction?.memo ?? null),
		successful: record.transaction?.successful ?? record.transaction_successful,
		createdAt: record.created_at,
	};
}

async function horizon<T>(path: string): Promise<T | null> {
	const response = await fetch(`${HORIZON_URL}${path}`, { headers: { Accept: "application/json" } });
	if (response.status === 404) return null;
	if (!response.ok) throw new Error(`Stellar network unavailable (HTTP ${response.status}). Retrying shortly.`);
	return (await response.json()) as T;
}

/** The latest 200 incoming payments to `account` (an unfunded account has none). */
export async function fetchIncomingPayments(account: string): Promise<ObservedPayment[]> {
	const page = await horizon<{ _embedded: { records: HorizonPaymentRecord[] } }>(
		`/accounts/${account}/payments?order=desc&limit=200&include_failed=true&join=transactions`,
	);
	return (page?._embedded.records ?? [])
		.filter((r) => PAYMENT_TYPES.has(r.type) && r.to === account)
		.map(toObserved);
}

/** One payment operation by id (for links to payments older than the latest page). */
export async function fetchPaymentOperation(id: string): Promise<ObservedPayment | null> {
	const record = await horizon<HorizonPaymentRecord>(`/operations/${id}?join=transactions`);
	return record && PAYMENT_TYPES.has(record.type) ? toObserved(record) : null;
}
