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
	status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
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

/** Planned (docs/PLAN.md): a detected payment and its verification result. */
export interface AdminPayment {
	id: string;
	transaction_hash: string;
	sender: string;
	recipient: string;
	asset_code: string;
	asset_issuer: string | null;
	amount: number;
	payment_reference: string | null;
	transaction_successful: boolean;
	verification_status: "detected" | "verified" | "invalid" | "unmatched" | "failed";
	reasons: string[];
	invoice_id: string | null;
	invoice_number: string | null;
	detected_at: string;
	verified_at: string | null;
	merchant_email: string;
}

export type Paged<K extends string, T> = { [key in K]: T[] } & { meta: PageMeta };
