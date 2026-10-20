import { read, update, type MockDb } from "../db";
import { SCENARIOS, buildPayment, type Scenario } from "../payments";
import { HttpError, ok, route } from "../router";
import { hex, iso, round2, uuid } from "../util";
import { num, paymentDto, primaryWallet } from "./present";

/**
 * The planned detection endpoints (docs/PLAN.md, D2) and the demo's payment simulator. A simulated
 * payment is "detected" for a few seconds, then gets its result; a valid one marks the invoice paid a
 * moment later, the way the backend will (detect → verify → match → mark paid).
 */

const DETECT_MS = 4_000;
const MARK_PAID_MS = 3_000;

/** Resolves simulated payments whose time has come. Runs before every mock request. */
export function settlePayments() {
	const now = Date.now();
	const db = read();
	const due = db.payments.some(
		(p) => (p.settles_at && p.settles_at <= now) || (p.invoice_paid_at && p.invoice_paid_at <= now),
	);
	if (!due) return;
	update((d) => {
		for (const p of d.payments) {
			if (p.settles_at && p.settles_at <= now) {
				p.verification_status = p.resolves_to ?? p.verification_status;
				p.verified_at = p.verification_status === "verified" ? iso(p.settles_at) : null;
				delete p.settles_at;
				notify(d, p.user_id, p.verification_status, p.invoice_number);
			}
			if (p.invoice_paid_at && p.invoice_paid_at <= now) {
				const invoice = d.invoices.find((i) => i.id === p.invoice_id);
				if (invoice && invoice.status !== "paid" && invoice.status !== "cancelled") {
					invoice.status = "paid";
					invoice.updated_at = iso(p.invoice_paid_at);
					const wallet = d.wallets.find((w) => w.address === p.recipient);
					if (wallet) wallet.usdc = round2(wallet.usdc + p.amount);
					d.transactions.unshift({
						id: uuid(),
						user_id: p.user_id,
						wallet_id: wallet?.id ?? "",
						transaction_hash: p.transaction_hash,
						amount: p.amount,
						currency: "usdc",
						status: "confirmed",
						network_fee: 0.00001,
						created_at: p.detected_at,
						confirmed_at: iso(p.invoice_paid_at),
						token_type: "credit_alphanum4",
						transaction_type: "funding",
						invoice_number: invoice.invoice_number,
					});
				}
				delete p.invoice_paid_at;
			}
		}
	});
}

function notify(db: MockDb, userId: string, status: string, invoiceNumber: string | null) {
	const copy: Record<string, [string, string]> = {
		verified: ["Payment verified", `Payment for ${invoiceNumber} was verified on Stellar.`],
		invalid: ["Payment needs review", `A payment for ${invoiceNumber} didn't meet the invoice requirements. The invoice stays unpaid.`],
		unmatched: ["Unmatched payment", "A payment arrived without a matching invoice reference."],
		failed: ["Payment failed", `A transaction for ${invoiceNumber ?? "an invoice"} failed on Stellar.`],
	};
	const [title, body] = copy[status] ?? [];
	if (title) db.notifications.unshift({ id: uuid(), user_id: userId, title, body: body!, viewed: false, created_at: iso(Date.now()) });
}

route("GET", "/payment", "user", ({ query, user }) => {
	const status = query.get("status");
	const list = read().payments.filter((p) => p.user_id === user!.id && (!status || status === "all" || p.verification_status === status));
	const limit = num(query.get("size") ?? query.get("limit"), 100);
	const pages = Math.max(1, Math.ceil(list.length / limit));
	const page = Math.min(num(query.get("page"), 1), pages);
	return ok({ payments: list.slice((page - 1) * limit, page * limit).map(paymentDto), meta: { page, limit, total: list.length, total_pages: pages } });
});

route("GET", "/payment/:id", "user", ({ params, user }) => {
	const payment = read().payments.find((p) => p.id === params.id && p.user_id === user!.id);
	if (!payment) throw new HttpError(404, "payment not found");
	return ok(paymentDto(payment));
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
			const now = Date.now();
			const rand = () => parseInt(hex(8), 16) / 0xffffffff;
			const payment = buildPayment({
				scenario,
				invoice,
				invoices: db.invoices.filter((i) => i.user_id === invoice.user_id),
				wallet,
				at: now,
				rand,
				settledInvoiceIds: settled,
				settleAfterMs: DETECT_MS,
			});
			if (payment.resolves_to === "verified") payment.invoice_paid_at = now + DETECT_MS + MARK_PAID_MS;
			db.payments.unshift(payment);
			return paymentDto(payment);
		}),
		"Simulated payment submitted",
		201,
	);
});

