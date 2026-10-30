import { read, update, type MockTransaction } from "../db";
import { HttpError, ok, route } from "../router";
import { hex, iso, round2, stellarAddress, uuid } from "../util";
import { num, primaryWallet, walletDto } from "./present";

/** /wallet/*, /transaction/*: the custodial wallet and its ledger. Testnet values only. */

const STATUS_FOR_TYPE = (t: string) => (t === "all" ? null : t);

route("POST", "/wallet", "user", ({ user }) =>
	ok(
		update((db) => {
			const existing = primaryWallet(db, user!.id);
			if (existing) throw new HttpError(409, "you already have a wallet");
			const wallet = { id: uuid(), user_id: user!.id, address: stellarAddress(), tag: "wallet_1", usdc: 0, xlm: 10_000, is_primary: true, created_at: iso(Date.now()) };
			db.wallets.push(wallet);
			db.transactions.unshift({
				id: uuid(),
				user_id: user!.id,
				wallet_id: wallet.id,
				transaction_hash: hex(64),
				amount: 10_000,
				currency: "xlm",
				status: "confirmed",
				network_fee: 0,
				created_at: wallet.created_at,
				confirmed_at: wallet.created_at,
				token_type: "native",
				transaction_type: "funding",
				invoice_number: "",
			});
			return walletDto(wallet);
		}),
		"Wallet created successfully",
		201,
	),
);

route("GET", "/wallet", "user", ({ user }) => {
	const wallet = primaryWallet(read(), user!.id);
	if (!wallet) throw new HttpError(404, "wallet not found");
	return ok(walletDto(wallet));
});

route("GET", "/wallet/lookup", "user", ({ query }) => {
	const db = read();
	const owner = db.users.find((u) => u.email.toLowerCase() === String(query.get("email") ?? "").toLowerCase());
	const wallet = owner && primaryWallet(db, owner.id);
	if (!wallet) throw new HttpError(404, "no wallet for that email");
	return ok({ address: wallet.address });
});

function myWallet(id: string, userId: string) {
	const wallet = read().wallets.find((w) => w.id === id && w.user_id === userId);
	if (!wallet) throw new HttpError(404, "wallet not found");
	return wallet;
}

route("GET", "/wallet/:id", "user", ({ params, user }) => ok(walletDto(myWallet(params.id!, user!.id))));

route("POST", "/wallet/:id/pin", "user", ({ params, body, user }) => {
	myWallet(params.id!, user!.id);
	const pin = String(body.pin ?? "");
	if (!/^\d{4,6}$/.test(pin)) throw new HttpError(400, "PIN must be 4 to 6 digits");
	update((db) => {
		db.users.find((u) => u.id === user!.id)!.pin = pin;
	});
	return ok(null, "Transaction PIN set successfully");
});

route("POST", "/wallet/:id/pay/transfer", "user", ({ params, body, user }) => {
	const wallet = myWallet(params.id!, user!.id);
	if (!user!.pin) throw new HttpError(400, "set a transaction PIN first");
	if (String(body.pin) !== user!.pin) throw new HttpError(401, "incorrect PIN");
	const amount = Number(body.amount);
	const asset = body.source_asset === "XLM" ? "xlm" : "usdc";
	if (!(amount > 0)) throw new HttpError(400, "enter an amount greater than zero");
	if (!/^G[A-Z2-7]{55}$/.test(String(body.destination_address ?? ""))) throw new HttpError(400, "enter a valid Stellar address (G…)");
	if (amount > wallet[asset]) throw new HttpError(400, "insufficient balance");
	return ok(
		update((db) => {
			const w = db.wallets.find((x) => x.id === wallet.id)!;
			w[asset] = round2(w[asset] - amount);
			const tx: MockTransaction = {
				id: uuid(),
				user_id: user!.id,
				wallet_id: w.id,
				transaction_hash: hex(64),
				amount,
				currency: asset,
				status: "confirmed",
				network_fee: 0.00001,
				created_at: iso(Date.now()),
				confirmed_at: iso(Date.now()),
				token_type: asset === "xlm" ? "native" : "credit_alphanum4",
				// Live (2026-10-24): outgoing transfers are path payments.
				transaction_type: "path_payment",
				invoice_number: "",
				source_amount: amount.toFixed(6),
				source_asset: asset.toUpperCase(),
			};
			db.transactions.unshift(tx);
			return {
				transaction_hash: tx.transaction_hash,
				source_asset: asset.toUpperCase(),
				source_amount: String(amount),
				dest_asset: String(body.dest_asset ?? asset.toUpperCase()),
				dest_amount: String(amount),
				destination: String(body.destination_address),
				fee_xlm: tx.network_fee,
			};
		}),
		"transfer successful",
	);
});

/** The live shape: the keys as JSON (the app draws the PDF). The mock never holds real keys. */
route("GET", "/wallet/export/:id", "user", ({ params, user }) => {
	const wallet = myWallet(params.id!, user!.id);
	return ok({ wallet_address: wallet.address, private_key: "SDEMO-MOCK-DATA-NOT-A-REAL-SECRET-KEY" }, "wallet exported");
});

// ---- Ledger ------------------------------------------------------------------------------

route("GET", "/transaction", "user", ({ query, user }) => {
	const status = STATUS_FOR_TYPE(query.get("status") ?? "all");
	const type = STATUS_FOR_TYPE(query.get("type") ?? "all");
	const list = read()
		.transactions.filter((t) => t.user_id === user!.id)
		.filter((t) => !status || t.status === status)
		.filter((t) => !type || t.transaction_type === type)
		.sort((a, b) => (query.get("order_by") === "asc" ? 1 : -1) * a.created_at.localeCompare(b.created_at));
	const limit = num(query.get("limit"), 10);
	const page = num(query.get("page"), 1);
	// Like the live API: incoming payments carry their invoice and no network fee.
	const items = list.slice((page - 1) * limit, page * limit).map(({ user_id: _u, invoice_number: _i, network_fee, ...t }) => {
		void _u;
		void _i;
		return t.transaction_type === "payment" || t.transaction_type === "path_payment" ? t : { ...t, network_fee };
	});
	// Live (2026-10-24): `items` + `meta`, with the older keys kept.
	return ok({ items, meta: { page, limit, total: list.length, total_pages: Math.max(1, Math.ceil(list.length / limit)) }, data: items, page, limit, total_count: list.length });
});

route("GET", "/transaction/id/:id", "user", ({ params, user }) => {
	const tx = read().transactions.find((t) => t.id === params.id && t.user_id === user!.id);
	if (!tx) throw new HttpError(404, "transaction not found");
	const { network_fee, ...rest } = tx;
	return ok(tx.transaction_type === "payment" || tx.transaction_type === "path_payment" ? rest : { ...rest, network_fee });
});

route("GET", "/transaction/status/:id", "user", ({ params, user }) => {
	const tx = read().transactions.find((t) => (t.id === params.id || t.transaction_hash === params.id) && t.user_id === user!.id);
	if (!tx) throw new HttpError(404, "transaction not found");
	return ok({ status: tx.status, transaction_hash: tx.transaction_hash, explorer_url: `https://stellar.expert/explorer/testnet/tx/${tx.transaction_hash}` });
});

/** Amounts in cents, as the live API returns them. */
route("GET", "/transaction/stats", "user", ({ user }) => {
	const mine = read().invoices.filter((i) => i.user_id === user!.id && i.status !== "draft");
	const sum = (s: string[]) => {
		const list = mine.filter((i) => s.includes(i.status));
		return { amount: Math.round(list.reduce((t, i) => t + i.total, 0) * 100), invoice_count: list.length };
	};
	return ok({
		total_amount: sum(["sent", "viewed", "paid", "expired", "invalid_payment", "cancelled"]),
		pending_amount: sum(["sent", "viewed"]),
		paid_amount: sum(["paid"]),
		overdue_amount: sum([]),
		expired_amount: sum(["expired"]),
		invalid_payment_amount: sum(["invalid_payment"]),
	});
});

/** Paid invoices per month between `from` and `to`, amounts in cents. */
route("GET", "/transaction/inflow", "user", ({ query, user }) => {
	const from = Date.parse(query.get("from") ?? "") || 0;
	const to = (Date.parse(query.get("to") ?? "") || Date.now()) + 86_399_999;
	const byMonth = new Map<string, { amount: number; invoices: number }>();
	for (const i of read().invoices) {
		const at = Date.parse(i.updated_at);
		if (i.user_id !== user!.id || i.status !== "paid" || at < from || at > to) continue;
		const d = new Date(at);
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
		const entry = byMonth.get(key) ?? { amount: 0, invoices: 0 };
		entry.amount += Math.round(i.total * 100);
		entry.invoices += 1;
		byMonth.set(key, entry);
	}
	return ok([...byMonth].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v })));
});
