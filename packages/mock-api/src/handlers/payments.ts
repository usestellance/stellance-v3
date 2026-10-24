import { read, update, type MockDb, type MockPayment } from "../db";
import { SCENARIOS, buildPayment, type Scenario } from "../payments";
import { HttpError, ok, route } from "../router";
import { iso, round2, uuid } from "../util";
import { num, ownInvoice, paymentDto, paymentRequestDto, primaryWallet } from "./present";

/**
 * The live payment endpoints (payments-v2, 2026-10-21) and the demo's payment simulator. A simulated
 * payment shows as pending for a few seconds, then gets its verdict; a valid one marks the invoice paid,
 * like the API does (detect → verify → match → mark paid).
 */

const DETECT_MS = 4_000;

/** What a settled payment does to the merchant's data, as the live API does it. */
function applyVerdict(db: MockDb, p: MockPayment, at: number) {
	const wallet = db.wallets.find((w) => w.address === p.recipient);
	const invoice = p.invoice_id ? db.invoices.find((i) => i.id === p.invoice_id) : undefined;

	// Every payment that reached the wallet is in the ledger as `payment`; a failed one is recorded as failed.
	db.transactions.unshift({
		id: uuid(),
		user_id: p.user_id,
		wallet_id: wallet?.id ?? "",
		transaction_hash: p.transaction_hash,
		amount: p.amount,
		currency: p.asset_code === "XLM" ? "xlm" : "usdc",
		status: p.transaction_successful ? "confirmed" : "failed",
		network_fee: 0,
		created_at: iso(at),
		confirmed_at: p.detected_at,
		token_type: p.asset_code === "XLM" ? "native" : "usdc",
		transaction_type: "payment",
		invoice_number: p.invoice_number ?? "",
		invoice_id: p.invoice_id ?? undefined,
	});
	if (wallet && p.transaction_successful) {
		if (p.asset_code === "XLM") wallet.xlm = round2(wallet.xlm + p.amount);
		else wallet.usdc = round2(wallet.usdc + p.amount);
	}

	if (invoice && invoice.status !== "paid" && invoice.status !== "cancelled") {
		if (p.verification_status === "verified") {
			invoice.status = "paid";
			invoice.updated_at = iso(at);
		} else if (p.verification_status === "invalid" || p.verification_status === "failed") {
			invoice.status = "invalid_payment";
			invoice.updated_at = iso(at);
		}
	}

	if (p.verification_status === "verified") {
		db.notifications.unshift({
			id: uuid(),
			user_id: p.user_id,
			title: "Invoice Paid",
			body: `Payment for invoice ${p.invoice_number} was verified on Stellar. Tx: ${p.transaction_hash}`,
			viewed: false,
			created_at: iso(at),
		});
	}
}

/** Resolves simulated payments whose time has come. Runs before every mock request. */
export function settlePayments() {
	const now = Date.now();
	if (!read().payments.some((p) => p.settles_at && p.settles_at <= now)) return;
	update((d) => {
		for (const p of d.payments) {
			if (!p.settles_at || p.settles_at > now) continue;
			p.verification_status = p.resolves_to ?? p.verification_status;
			p.verified_at = p.verification_status === "verified" ? iso(p.settles_at) : null;
			delete p.settles_at;
			applyVerdict(d, p, now);
		}
	});
}

/** GET /payments: `{ payments, meta }`, `page` + `limit` (default 20, max 100), optional `status`. */
route("GET", "/payments", "user", ({ query, user }) => {
	const status = query.get("status");
	const list = read()
		.payments.filter((p) => p.user_id === user!.id)
		.filter((p) => !status || paymentDto(p).verification_status === status)
		.sort((a, b) => b.detected_at.localeCompare(a.detected_at));
	const limit = Math.min(num(query.get("limit"), 20), 100);
	const total_pages = Math.max(1, Math.ceil(list.length / limit));
	const page = Math.min(num(query.get("page"), 1), total_pages);
	return ok(
		{ payments: list.slice((page - 1) * limit, page * limit).map((p) => paymentDto(p)), meta: { page, limit, total: list.length, total_pages } },
		"payments",
	);
});

route("GET", "/payments/:id", "user", ({ params, user }) => {
	const payment = read().payments.find((p) => p.id === params.id && p.user_id === user!.id);
	if (!payment) throw new HttpError(404, "payment not found");
	return ok(paymentDto(payment), "payment");
});

route("GET", "/payments/invoice/:id", "user", ({ params, user }) => {
	const db = read();
	return ok(paymentRequestDto(db, ownInvoice(db, params.id!, user), true), "payment details");
});

route("GET", "/payments/request/:url", "public", ({ params }) => {
	const db = read();
	const invoice = db.invoices.find((i) => i.invoice_url === params.url);
	if (!invoice) throw new HttpError(404, "invoice not found");
	return ok(paymentRequestDto(db, invoice, false), "payment request");
});

route("POST", "/payments/verify", "user", ({ body, user }) => {
	const hash = String(body.transaction_hash ?? "").trim();
	if (!hash) throw new HttpError(400, "Transaction Hash is required; ");
	if (hash.length !== 64) throw new HttpError(400, "Transaction Hash must be exactly 64 characters long; ");
	const found = read().payments.filter((p) => p.transaction_hash === hash && p.user_id === user!.id);
	if (!found.length) throw new HttpError(404, "transaction not found on Stellar");
	return ok(found.map((p) => paymentDto(p)), "transaction checked");
});

/**
 * Demo only: "a customer just paid". Public, so the customer's payment page can use it too.
 * Scenarios: correct, insufficient, wrong_asset, no_memo, unknown_memo, failed, duplicate.
 */
route("POST", "/mock/payments/simulate", "public", ({ body }) => {
	const scenario = String(body.scenario) as Scenario;
	if (!SCENARIOS.includes(scenario)) throw new HttpError(400, `scenario must be one of ${SCENARIOS.join(", ")}`);
	return ok(
		update((db) => {
			const invoice = db.invoices.find((i) => i.id === body.invoice_id);
			if (!invoice) throw new HttpError(404, "invoice not found");
			const wallet = primaryWallet(db, invoice.user_id);
			if (!wallet) throw new HttpError(409, "the merchant has no wallet");
			const settled = new Set(
				db.payments.filter((p) => (p.resolves_to ?? p.verification_status) === "verified" && p.invoice_id).map((p) => p.invoice_id!),
			);
			if (invoice.status === "paid") settled.add(invoice.id);
			const rand = () => Math.random();
			const payment = buildPayment({
				scenario,
				invoice,
				invoices: db.invoices.filter((i) => i.user_id === invoice.user_id),
				wallet,
				at: Date.now(),
				rand,
				settledInvoiceIds: settled,
				settleAfterMs: DETECT_MS,
			});
			db.payments.unshift(payment);
			return paymentDto(payment);
		}),
		"Simulated payment submitted",
		201,
	);
});
