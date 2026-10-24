export interface ITransaction {
	id: string;
	amount: number;
	confirmed_at: string;
	created_at: string;
	currency: string;
	/** Not returned for incoming payments. */
	network_fee?: number;
	/** On-chain result. */
	status: "confirmed" | "pending" | "failed" | "aborted" | "refunded";
	token_type: string;
	transaction_hash: string;
	/**
	 * `funding` (wallet created) and `payment` (an invoice or other payment received) come in; the rest go out.
	 * `transfer` is the older name for an outgoing payment.
	 */
	transaction_type: "funding" | "payment" | "withdrawal" | "path_payment" | "transfer";
	wallet_id: string;
	/** Set when the transaction paid an invoice. */
	invoice_id?: string | null;
	/** Path payments: what was spent to deliver `amount`. */
	source_amount?: number | null;
	source_asset?: string | null;
}

const INCOMING = new Set<ITransaction["transaction_type"]>(["funding", "payment"]);

/** Didn't move money: shown struck through, with no sign. */
export const isUnsettled = (tx: Pick<ITransaction, "status">) => tx.status === "failed" || tx.status === "aborted";

export const TX_STATUS_STYLE: Record<ITransaction["status"], string> = {
	confirmed: "text-success-500 bg-success-50",
	pending: "text-warning-600 bg-warning-50",
	failed: "text-error-500 bg-error-50",
	aborted: "text-error-500 bg-error-50",
	refunded: "text-info-500 bg-info-50",
};

/** What a merchant calls each entry: the API sends outgoing transfers as `path_payment`. */
const TX_TYPE_LABEL: Record<string, string> = { path_payment: "transfer" };
export const txTypeLabel = (type: string) => TX_TYPE_LABEL[type] ?? type.replace(/_/g, " ");

export const isIncoming = (tx: Pick<ITransaction, "transaction_type">) => INCOMING.has(tx.transaction_type);

/** "2.03 USDC" / "10,000 XLM": token amounts carry no currency symbol. */
export const formatTokenAmount = (amount: number, currency: string) =>
	`${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 }).format(amount)} ${currency.toUpperCase()}`;
