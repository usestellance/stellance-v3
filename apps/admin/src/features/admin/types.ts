/** The /admin/* responses, as the live API returns them (captured 2026-10-20). */

export interface PageMeta {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}

export interface AdminStats {
	total_users: number;
	active_users: number;
	total_invoices: number;
	paid_invoices: number;
	overdue_count: number;
	total_revenue: number;
}

export interface AdminUser {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role: "user" | "admin";
	email_verified: boolean;
	is_active: boolean;
	created_at: string;
}

export interface AdminWallet {
	id: string;
	address: string;
	tag: string;
	usdc_balance: number;
	xlm_balance: number;
	is_primary: boolean;
}

export interface AdminActivity {
	id: string;
	user_id: string;
	action: string;
	created_at: string;
}

export interface AdminInvoice {
	id: string;
	invoice_number: string;
	creator_email: string;
	payer_email: string;
	total: number;
	currency: string;
	status: "draft" | "sent" | "viewed" | "paid" | "expired" | "invalid_payment" | "overdue" | "cancelled";
	created_at: string;
}

export interface AdminTransaction {
	id: string;
	invoice_number: string;
	user_email: string;
	amount: number;
	type: "funding" | "withdrawal" | "transfer";
	status: "confirmed" | "pending" | "failed";
	created_at: string;
}

export interface AdminUserDetail {
	user: AdminUser;
	wallets: AdminWallet[];
	recent_activity: AdminActivity[];
	recent_transactions: AdminTransaction[];
}

/** A detected payment and its verdict (GET /admin/payments, live since 2026-10-22). */
export interface AdminPayment {
	id: string;
	invoice_id?: string | null;
	transaction_hash: string;
	explorer_url?: string | null;
	sender: string;
	recipient: string;
	invoice_number?: string | null;
	merchant_email?: string | null;
	asset_code?: string;
	asset_issuer?: string | null;
	/** Before 2026-10-24: "CODE:ISSUER", or "XLM". */
	asset?: string;
	amount: string | number;
	payment_reference: string | null;
	verification_status: "pending" | "detected" | "verified" | "invalid" | "unmatched" | "failed";
	failure_code?: string | null;
	failure_reason?: string | null;
	ledger_closed_at?: string;
	detected_at: string;
	verified_at?: string | null;
}

export type Paged<K extends string, T> = { [key in K]: T[] } & { meta: PageMeta };
