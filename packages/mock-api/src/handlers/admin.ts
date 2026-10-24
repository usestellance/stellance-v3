import { read, update, type MockDb, type MockTransaction } from "../db";
import { HttpError, ok, route } from "../router";
import { round2 } from "../util";
import { num, paymentDto } from "./present";

/** /admin/*: the shapes the live API returns (captured 2026-10-20), plus the planned /admin/payments. */

function page<T>(list: T[], query: URLSearchParams, key: string) {
	const limit = num(query.get("limit"), 20);
	const total_pages = Math.max(1, Math.ceil(list.length / limit));
	const current = Math.min(num(query.get("page"), 1), total_pages);
	return { [key]: list.slice((current - 1) * limit, current * limit), meta: { page: current, limit, total: list.length, total_pages } };
}

const userRow = (u: MockDb["users"][number]) => ({
	id: u.id,
	email: u.email,
	first_name: u.first_name,
	last_name: u.last_name,
	role: u.role,
	email_verified: u.email_verified,
	is_active: u.is_active,
	created_at: u.created_at,
});

function invoiceRow(db: MockDb, i: MockDb["invoices"][number]) {
	return {
		id: i.id,
		invoice_number: i.invoice_number,
		creator_email: db.users.find((u) => u.id === i.user_id)?.email ?? "",
		payer_email: i.payer_email,
		total: i.total,
		currency: i.currency,
		status: i.status,
		created_at: i.created_at,
	};
}

function txRow(db: MockDb, t: MockTransaction) {
	return {
		id: t.id,
		invoice_number: t.invoice_number,
		user_email: db.users.find((u) => u.id === t.user_id)?.email ?? "",
		amount: t.amount,
		type: t.transaction_type,
		status: t.status,
		created_at: t.created_at,
	};
}

const matches = (search: string | null, ...values: string[]) => !search || values.some((v) => v.toLowerCase().includes(search.toLowerCase()));

route("GET", "/admin/stats", "admin", () => {
	const db = read();
	const paid = db.invoices.filter((i) => i.status === "paid");
	return ok({
		total_users: db.users.length,
		active_users: db.users.filter((u) => u.is_active).length,
		total_invoices: db.invoices.length,
		paid_invoices: paid.length,
		overdue_count: 0,
		total_revenue: round2(paid.reduce((s, i) => s + i.total, 0)),
	});
});

route("GET", "/admin/users", "admin", ({ query }) => {
	const s = query.get("search");
	const list = read()
		.users.filter((u) => matches(s, u.email, u.first_name, u.last_name))
		.sort((a, b) => b.created_at.localeCompare(a.created_at))
		.map(userRow);
	return ok(page(list, query, "users"));
});

route("GET", "/admin/users/:id", "admin", ({ params }) => {
	const db = read();
	const user = db.users.find((u) => u.id === params.id);
	if (!user) throw new HttpError(404, "user not found");
	return ok({
		user: userRow(user),
		wallets: db.wallets
			.filter((w) => w.user_id === user.id)
			.map((w) => ({ id: w.id, address: w.address, tag: w.tag, usdc_balance: w.usdc, xlm_balance: w.xlm, is_primary: w.is_primary })),
		recent_activity: db.activity.filter((a) => a.user_id === user.id).slice(0, 20),
		recent_transactions: db.transactions.filter((t) => t.user_id === user.id).slice(0, 10).map((t) => txRow(db, t)),
	});
});

route("DELETE", "/admin/users/:id", "admin", ({ params, user }) => {
	if (params.id === user!.id) throw new HttpError(400, "you can't delete your own account");
	update((db) => {
		if (!db.users.some((u) => u.id === params.id)) throw new HttpError(404, "user not found");
		const invoiceIds = new Set(db.invoices.filter((i) => i.user_id === params.id).map((i) => i.id));
		db.users = db.users.filter((u) => u.id !== params.id);
		db.wallets = db.wallets.filter((w) => w.user_id !== params.id);
		db.invoices = db.invoices.filter((i) => !invoiceIds.has(i.id));
		db.transactions = db.transactions.filter((t) => t.user_id !== params.id);
		db.activity = db.activity.filter((a) => a.user_id !== params.id);
	});
	return ok(null, "User deleted");
});

route("GET", "/admin/users/:id/activity", "admin", ({ params, query }) =>
	ok(page(read().activity.filter((a) => a.user_id === params.id), query, "logs")),
);

route("GET", "/admin/users/:id/invoices", "admin", ({ params, query }) => {
	const db = read();
	return ok(page(db.invoices.filter((i) => i.user_id === params.id).map((i) => invoiceRow(db, i)), query, "invoices"));
});

route("GET", "/admin/users/:id/transactions", "admin", ({ params, query }) => {
	const db = read();
	return ok(page(db.transactions.filter((t) => t.user_id === params.id).map((t) => txRow(db, t)), query, "transactions"));
});

route("POST", "/admin/users/:id/reset-password", "admin", ({ params }) => {
	if (!read().users.some((u) => u.id === params.id)) throw new HttpError(404, "user not found");
	return ok(null, "Password reset email sent");
});

route("PATCH", "/admin/users/:id/status", "admin", ({ params, query, user }) => {
	const active = query.get("active") === "true";
	if (params.id === user!.id && !active) throw new HttpError(400, "you can't suspend your own account");
	return ok(
		update((db) => {
			const target = db.users.find((u) => u.id === params.id);
			if (!target) throw new HttpError(404, "user not found");
			target.is_active = active;
			return userRow(target);
		}),
		active ? "User activated" : "User suspended",
	);
});

route("GET", "/admin/invoices", "admin", ({ query }) => {
	const db = read();
	const status = query.get("status");
	const s = query.get("search");
	const list = db.invoices
		.filter((i) => !status || status === "all" || i.status === status)
		.map((i) => invoiceRow(db, i))
		.filter((i) => matches(s, i.invoice_number, i.creator_email, i.payer_email))
		.sort((a, b) => b.created_at.localeCompare(a.created_at));
	return ok(page(list, query, "invoices"));
});

route("GET", "/admin/invoices/:id", "admin", ({ params }) => {
	const db = read();
	const invoice = db.invoices.find((i) => i.id === params.id);
	if (!invoice) throw new HttpError(404, "invoice not found");
	return ok(invoiceRow(db, invoice));
});

route("GET", "/admin/transactions", "admin", ({ query }) => {
	const db = read();
	const s = query.get("search");
	const list = db.transactions
		.map((t) => txRow(db, t))
		.filter((t) => matches(s, t.user_email, t.invoice_number, t.type))
		.sort((a, b) => b.created_at.localeCompare(a.created_at));
	return ok(page(list, query, "transactions"));
});

route("GET", "/admin/config/network", "admin", () => ok({ network: read().network }));

/** Every detected payment across merchants (live since 2026-10-22): page/limit, status, search. */
route("GET", "/admin/payments", "admin", ({ query }) => {
	const db = read();
	const status = query.get("status");
	const s = query.get("search");
	const list = db.payments
		.map((p) => ({ p, dto: paymentDto(p, db.users.find((x) => x.id === p.user_id)?.email ?? "") }))
		.filter(({ dto }) => !status || status === "all" || dto.verification_status === status)
		.filter(({ p }) => matches(s, p.transaction_hash, p.payment_reference ?? "", p.recipient, p.sender, p.invoice_number ?? ""))
		.sort((a, b) => b.p.detected_at.localeCompare(a.p.detected_at))
		.map(({ dto }) => dto);
	return ok(page(list, query, "payments"), "payments");
});
