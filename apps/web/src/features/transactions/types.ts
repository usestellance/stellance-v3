// export interface ITransaction {
//   id: number;
//   type: "sent" | "received";
//   amount: number;
//   currency: "USDC" | "XLM";
//   date: string;
//   status: "completed" | "pending" | "failed";
// }

export interface ITransaction {
	id: string;
	amount: number;
	confirmed_at: string;
	created_at: string;
	currency: string;
	network_fee: number;
	status: "confirmed" | "pending" | "failed";
	token_type: string;
	transaction_hash: string;
	transaction_type: "funding" | "withdrawal" | "transfer";
	wallet_id: string;
}