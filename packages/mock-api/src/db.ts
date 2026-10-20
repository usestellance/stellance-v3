import { buildSeed } from "./seed";

/**
 * The mock backend's data: one JSON document in localStorage, shaped like the live API's records
 * (captured from api.usestellance.com, docs/PLAN.md). Reads return deep copies so handlers never
 * mutate state by accident; `update` is the only way to write. `resetMockDb()` restores the seed.
 */

export { USDC_ISSUER } from "./util";

export type Role = "user" | "admin";

export interface MockUser {
	id: string;
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	business_name: string;
	phone_number: string;
	country: string;
	role: Role;
	email_verified: boolean;
	is_active: boolean;
	profile_complete: boolean;
	pin: string | null;
	created_at: string;
	updated_at: string;
}

export interface MockWallet {
	id: string;
	user_id: string;
	address: string;
	tag: string;
	usdc: number;
	xlm: number;
	is_primary: boolean;
	created_at: string;
}

export interface MockInvoiceItem {
	item_id: string;
	invoice_type: "per_hour" | "per_unit";
	description: string;
	quantity: number;
	unit_price: number;
	discount: number;
	amount: number;
	created_at: string;
}

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";

export interface MockInvoice {
	id: string;
	user_id: string;
	invoice_number: string;
	invoice_url: string;
	title: string;
	payer_email: string;
	payer_name: string;
	country: string;
	sub_total: number;
	service_fee: number;
	total: number;
	currency: "usdc";
	status: InvoiceStatus;
	due_date: string;
	created_at: string;
	updated_at: string;
	items: MockInvoiceItem[];
	approved: boolean;
	review_date: string | null;
	template_id: string;
	logo_url: string | null;
	note: string;
	// Payment requirements (proposed contract, docs/PLAN.md D1).
	payment_reference: string;
	payment_asset_code: string;
	payment_asset_issuer: string;
	payment_amount: number;
	payment_expires_at: string;
}

export interface MockComment {
	id: string;
	invoice_id: string;
	user_id: string | null;
	commenter_name: string;
	commenter_email: string;
	comment_text: string;
	parent_comment_id: string | null;
	is_guest: boolean;
	created_at: string;
}

export interface MockNotification {
	id: string;
	user_id: string;
	title: string;
	body: string;
	viewed: boolean;
	created_at: string;
}

export interface MockTransaction {
	id: string;
	user_id: string;
	wallet_id: string;
	transaction_hash: string;
	amount: number;
	currency: "usdc" | "xlm";
	status: "confirmed" | "pending" | "failed";
	network_fee: number;
	created_at: string;
	confirmed_at: string;
	token_type: string;
	transaction_type: "funding" | "withdrawal" | "transfer";
	invoice_number: string;
}

export type VerificationStatus = "detected" | "verified" | "invalid" | "unmatched" | "failed";
export type CheckResult = "pass" | "fail" | "skip";

export interface MockPayment {
	id: string;
	user_id: string;
	transaction_hash: string;
	sender: string;
	recipient: string;
	asset_code: string;
	asset_issuer: string | null;
	amount: number;
	payment_reference: string | null;
	transaction_successful: boolean;
	verification_status: VerificationStatus;
	reasons: string[];
	checks: Record<"recipient" | "asset" | "amount" | "reference" | "success" | "invoice", CheckResult>;
	invoice_id: string | null;
	invoice_number: string | null;
	expected: { amount: number; asset_code: string; asset_issuer: string | null; recipient: string; payment_reference: string } | null;
	detected_at: string;
	verified_at: string | null;
	/** Simulated payments stay "detected" until this time (ms), then show their result. */
	settles_at?: number;
	/** The status the payment resolves to once settled. */
	resolves_to?: VerificationStatus;
	/** For a simulated valid payment: when the "backend" marks the invoice paid (ms). */
	invoice_paid_at?: number;
}

export interface MockActivity {
	id: string;
	user_id: string;
	action: string;
	created_at: string;
}

export interface MockDb {
	version: number;
	seededAt: string;
	users: MockUser[];
	wallets: MockWallet[];
	invoices: MockInvoice[];
	comments: MockComment[];
	notifications: MockNotification[];
	transactions: MockTransaction[];
	payments: MockPayment[];
	activity: MockActivity[];
	network: "testnet" | "mainnet";
}

const KEY = "stellance-mock-db";
const VERSION = 3;

let memory: MockDb | null = null;

function storage(): Storage | null {
	try {
		return typeof window === "undefined" ? null : window.localStorage;
	} catch {
		return null;
	}
}

function load(): MockDb {
	if (memory) return memory;
	const raw = storage()?.getItem(KEY);
	if (raw) {
		try {
			const parsed = JSON.parse(raw) as MockDb;
			if (parsed.version === VERSION) return (memory = parsed);
		} catch {
			// Corrupt or older document: fall through to a fresh seed.
		}
	}
	memory = buildSeed(VERSION);
	save(memory);
	return memory;
}

function save(db: MockDb) {
	memory = db;
	try {
		storage()?.setItem(KEY, JSON.stringify(db));
	} catch {
		// Private mode or quota: keep working from memory.
	}
}

/** A deep copy of the current data. */
export function read(): MockDb {
	return structuredClone(load());
}

/** Applies a change and persists it. */
export function update<T>(change: (db: MockDb) => T): T {
	const db = structuredClone(load());
	const result = change(db);
	save(db);
	return result;
}

/** Back to the seed (the demo's "Reset demo data"). */
export function resetMockDb() {
	memory = null;
	storage()?.removeItem(KEY);
	load();
}
