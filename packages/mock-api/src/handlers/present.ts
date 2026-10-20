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

export function invoiceDto(db: MockDb, invoice: MockInvoice) {
	const owner = db.users.find((u) => u.id === invoice.user_id);
	const { user_id: _owner, ...rest } = invoice;
	void _owner;
	return {
		...rest,
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

/** A payment as the planned API returns it. While "detected", the checks aren't reported yet. */
export function paymentDto(payment: MockPayment) {
	const { settles_at, resolves_to: _r, invoice_paid_at: _p, user_id: _u, ...rest } = payment;
	void _r;
	void _p;
	void _u;
	if (payment.verification_status === "detected" && settles_at) {
		return {
			...rest,
			reasons: [],
			checks: { recipient: "skip", asset: "skip", amount: "skip", reference: "skip", success: "skip", invoice: "skip" },
		};
	}
	return rest;
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
