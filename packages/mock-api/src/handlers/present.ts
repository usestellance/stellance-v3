import type { MockDb, MockInvoice, MockPayment, MockUser, MockWallet } from "../db";
import { HttpError } from "../router";

/** Shapes records the way the live API returns them (captured responses, docs/PLAN.md). */

export const primaryWallet = (db: MockDb, userId: string): MockWallet | undefined =>
	db.wallets.find((w) => w.user_id === userId && w.is_primary) ?? db.wallets.find((w) => w.user_id === userId);

export function walletDto(wallet: MockWallet | undefined) {
	if (!wallet) return null;
	return { id: wallet.id, address: wallet.address, balance: { usdc: wallet.usdc, xlm: wallet.xlm } };
}

export function profileDto(user: MockUser) {
	return {
		id: user.id,
		email: user.email,
		first_name: user.first_name,
		last_name: user.last_name,
		business_name: user.business_name,
		phone_number: user.phone_number,
		country: user.country,
		is_active: user.is_active,
		email_verified: user.email_verified,
		role: user.role,
		created_at: user.created_at,
		updated_at: user.updated_at,
	};
}

/** An invoice as the live API returns it: no payment fields (those live on /payments/*), plus `paid_at`. */
export function invoiceDto(db: MockDb, invoice: MockInvoice) {
	const owner = db.users.find((u) => u.id === invoice.user_id);
	const {
		user_id: _owner,
		payment_reference: _ref,
		payment_asset_code: _code,
		payment_asset_issuer: _issuer,
		payment_amount: _amount,
		payment_expires_at: _expires,
		...rest
	} = invoice;
	void [_owner, _ref, _code, _issuer, _amount, _expires];
	const verified = db.payments.find((p) => p.invoice_id === invoice.id && p.verification_status === "verified");
	return {
		...rest,
		paid_at: invoice.status === "paid" ? (verified?.verified_at ?? invoice.updated_at) : null,
		createdBy: owner
			? {
					user_id: owner.id,
					name: `${owner.first_name} ${owner.last_name}`,
					email: owner.email,
					location: owner.country,
					business_name: owner.business_name,
					phone_number: owner.phone_number,
					wallet_address: primaryWallet(db, owner.id)?.address ?? "",
				}
			: undefined,
	};
}

/** The live API's wording for each verdict (captured 2026-10-21/23). */
function failureReason(payment: MockPayment): string | null {
	const reason = payment.reasons[0];
	switch (reason) {
		case "insufficient_amount":
			return `insufficient amount: expected ${Math.round((payment.expected?.amount ?? 0) * 1e7)} stroops, received ${Math.round(payment.amount * 1e7)}`;
		case "wrong_asset":
			return `expected asset ${payment.expected?.asset_code}:${payment.expected?.asset_issuer}, received ${payment.asset_issuer ? `${payment.asset_code}:${payment.asset_issuer}` : payment.asset_code}`;
		case "missing_reference":
			return "payment has no text memo reference";
		case "unknown_reference":
			return "no invoice matches the payment reference";
		case "transaction_failed":
			return "transaction failed on Stellar";
		case "duplicate":
			return "invoice is already paid";
		case "wrong_recipient":
			return "payment recipient is not the invoice recipient";
		default:
			return null;
	}
}

const explorer = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`;

/** Amounts travel as strings with 7 decimals (stroop precision), like the live API. */
const stroops = (amount: number) => amount.toFixed(7);

/**
 * A payment record as the live API returns it (captured 2026-10-24): GET /payments, /payments/{id},
 * /payments/invoice/{id}; /admin/payments adds `merchant_email`.
 */
export function paymentDto(payment: MockPayment, merchantEmail?: string) {
	const pending = payment.verification_status === "detected" && !!payment.settles_at;
	return {
		id: payment.id,
		invoice_id: payment.invoice_id,
		invoice_number: payment.invoice_number,
		transaction_hash: payment.transaction_hash,
		explorer_url: explorer(payment.transaction_hash),
		sender: payment.sender,
		recipient: payment.recipient,
		asset_code: payment.asset_code,
		asset_issuer: payment.asset_issuer,
		amount: stroops(payment.amount),
		payment_reference: payment.payment_reference,
		verification_status: pending ? "pending" : payment.verification_status,
		failure_code: pending ? null : (payment.reasons[0] ?? null),
		failure_reason: pending ? null : failureReason(payment),
		checks: pending ? null : payment.checks,
		expected: payment.expected && { ...payment.expected, amount: stroops(payment.expected.amount) },
		ledger_closed_at: new Date(Date.parse(payment.detected_at) - 5_000).toISOString(),
		detected_at: payment.detected_at,
		verified_at: payment.verified_at,
		...(merchantEmail !== undefined ? { merchant_email: merchantEmail } : {}),
	};
}

const PAYMENT_STATUS: Record<string, string> = {
	draft: "draft",
	sent: "awaiting_payment",
	viewed: "awaiting_payment",
	paid: "paid",
	expired: "expired",
	cancelled: "cancelled",
	invalid_payment: "invalid_payment",
};

/**
 * An invoice's payment request as the live API returns it: GET /payments/request/{url} (public) and, with
 * `withPayments`, GET /payments/invoice/{id} (merchant).
 */
export function paymentRequestDto(db: MockDb, invoice: MockInvoice, withPayments: boolean) {
	const attempts = db.payments
		.filter((p) => p.invoice_id === invoice.id)
		.sort((a, b) => b.detected_at.localeCompare(a.detected_at));
	const latest = attempts[0];
	const verified = attempts.find((p) => p.verification_status === "verified");
	const pending = attempts.some((p) => p.verification_status === "detected" && p.settles_at);
	return {
		invoice_id: invoice.id,
		invoice_number: invoice.invoice_number,
		invoice_status: invoice.status,
		payment_status: pending && invoice.status !== "paid" ? "payment_detected" : (PAYMENT_STATUS[invoice.status] ?? "awaiting_payment"),
		amount: stroops(invoice.payment_amount),
		asset_code: invoice.payment_asset_code,
		asset_issuer: invoice.payment_asset_issuer,
		recipient: primaryWallet(db, invoice.user_id)?.address ?? "",
		payment_reference: invoice.payment_reference,
		network: "testnet",
		expires_at: invoice.payment_expires_at,
		...(latest
			? {
					payment_detected_at: latest.detected_at,
					verification_status: latest.verification_status === "detected" && latest.settles_at ? "pending" : latest.verification_status,
				}
			: {}),
		...(verified
			? {
					verified_at: verified.verified_at,
					paid_at: verified.verified_at,
					transaction_hash: verified.transaction_hash,
					explorer_url: explorer(verified.transaction_hash),
				}
			: {}),
		...(withPayments ? { payments: attempts.map((p) => paymentDto(p)) } : {}),
	};
}

export function ownInvoice(db: MockDb, id: string, user: MockUser | null) {
	const invoice = db.invoices.find((i) => i.id === id);
	if (!invoice || (user && user.role !== "admin" && invoice.user_id !== user.id)) throw new HttpError(404, "invoice not found");
	return invoice;
}

export const num = (value: string | null, fallback: number) => {
	const n = Number(value);
	return Number.isFinite(n) && n > 0 ? n : fallback;
};
