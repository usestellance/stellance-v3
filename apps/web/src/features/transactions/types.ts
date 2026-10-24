export interface ITransaction {
	id: string;
	amount: number;
	confirmed_at: string;
	created_at: string;
	currency: string;
	/** Not returned for incoming payments. */
	network_fee?: number;
	status: "confirmed" | "pending" | "failed";
	token_type: string;
	transaction_hash: string;
	/** `funding` (wallet created) and `payment` (an invoice or other payment received) come in; the rest go out. */
	transaction_type: "funding" | "payment" | "withdrawal" | "transfer";
	wallet_id: string;
	/** Set when the transaction paid an invoice. */
	invoice_id?: string;
}

const INCOMING = new Set<ITransaction["transaction_type"]>(["funding", "payment"]);

export const isIncoming = (tx: Pick<ITransaction, "transaction_type">) => INCOMING.has(tx.transaction_type);

/** "2.03 USDC" / "10,000 XLM": token amounts carry no currency symbol. */
export const formatTokenAmount = (amount: number, currency: string) =>
	`${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 }).format(amount)} ${currency.toUpperCase()}`;
