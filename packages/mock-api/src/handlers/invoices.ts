import { read, update, USDC_ISSUER, type InvoiceStatus, type MockDb, type MockInvoice, type MockInvoiceItem, type MockUser } from "../db";
import { HttpError, ok, route } from "../router";
import { DAY, hex, iso, round2, uuid } from "../util";
import { invoiceDto, num, ownInvoice } from "./present";

/** /invoice/*: CRUD (multipart, like the API), send, public view by URL, review, stats, overview. */

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function parseItems(raw: unknown): MockInvoiceItem[] {
	let list: Array<Partial<MockInvoiceItem>> = [];
	try {
		list = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
	} catch {
		throw new HttpError(400, "invoice_items must be valid JSON");
	}
	return list.map((item) => {
		const quantity = Number(item.quantity) || 0;
		const unit_price = Number(item.unit_price) || 0;
		const discount = Number(item.discount) || 0;
		return {
			item_id: item.item_id ?? uuid(),
			invoice_type: item.invoice_type === "per_hour" ? "per_hour" : "per_unit",
			description: String(item.description ?? ""),
			quantity,
			unit_price,
			discount,
			amount: round2(quantity * unit_price * (1 - discount / 100)),
			created_at: item.created_at ?? iso(Date.now()),
		};
	});
}

/** The logo upload: kept as a data URL when small enough for localStorage, dropped otherwise. */
async function logoUrl(file: unknown): Promise<string | null | undefined> {
	if (typeof Blob === "undefined" || !(file instanceof Blob)) return undefined;
	if (file.size > 300_000) return null;
	return await new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => resolve(null);
		reader.readAsDataURL(file);
	});
}

/** Like the live API: `service_fee` is an amount added to what the client pays (the web app sends 0). */
function totals(items: MockInvoiceItem[], fee = 0) {
	const sub_total = round2(items.reduce((s, i) => s + i.amount, 0));
	const service_fee = round2(Math.max(fee, 0));
	return { sub_total, service_fee, total: round2(sub_total + service_fee) };
}

function nextNumber(db: MockDb) {
	const d = new Date();
	const seq = db.invoices.length + 1;
	return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(seq).padStart(4, "0")}`;
}

function listFor(db: MockDb, user: MockUser, query: URLSearchParams) {
	const status = query.get("status");
	const search = query.get("search")?.trim().toLowerCase();
	const order = query.get("order_by") === "asc" ? 1 : -1;
	return db.invoices
		.filter((i) => i.user_id === user.id)
		.filter((i) => !status || status === "all" || i.status === status)
		.filter(
			(i) =>
				!search ||
				[i.invoice_number, i.title, i.payer_name, i.payer_email, i.payment_reference].some((v) => v.toLowerCase().includes(search)),
		)
		.sort((a, b) => order * a.created_at.localeCompare(b.created_at));
}

route("GET", "/invoice", "user", ({ query, user }) => {
	const db = read();
	const list = listFor(db, user!, query);
	const limit = num(query.get("limit") ?? query.get("page_count"), 10);
	const pages = Math.max(1, Math.ceil(list.length / limit));
	const page = Math.min(num(query.get("page"), 1), pages);
	return ok({
		items: list.slice((page - 1) * limit, page * limit).map((i) => invoiceDto(db, i)),
		invoice: list.slice((page - 1) * limit, page * limit).map((i) => invoiceDto(db, i)),
		meta: { page, limit, total: list.length, page_count: limit, total_invoice_count: list.length, total_pages: pages },
	});
});

route("POST", "/invoice", "user", async ({ body, user }) => {
	const items = parseItems(body.invoice_items);
	if (!items.length) throw new HttpError(400, "add at least one invoice item");
	if (!String(body.payer_email ?? "").includes("@")) throw new HttpError(400, "a valid payer email is required");
	const logo = await logoUrl(body.logo);
	const created = update((db) => {
		const now = Date.now();
		const number = nextNumber(db);
		const amounts = totals(items, Number(body.service_fee) || 0);
		const due = Date.parse(String(body.due_date)) || now + 14 * DAY;
		const invoice: MockInvoice = {
			id: uuid(),
			user_id: user!.id,
			invoice_number: number,
			invoice_url: hex(30),
			title: String(body.title ?? items[0]!.description),
			payer_email: String(body.payer_email),
			payer_name: String(body.payer_name ?? ""),
			country: String(body.country ?? ""),
			...amounts,
			currency: "usdc",
			status: "draft",
			due_date: iso(due),
			created_at: iso(now),
			updated_at: iso(now),
			items,
			approved: false,
			review_date: null,
			template_id: String(body.template_id || "template_001"),
			logo_url: logo ?? null,
			note: String(body.note ?? ""),
			// Like the API: a unique STL- memo reference, not the invoice number.
			payment_reference: `STL-${hex(12).toUpperCase()}`,
			payment_asset_code: "USDC",
			payment_asset_issuer: USDC_ISSUER,
			payment_amount: amounts.total,
			payment_expires_at: iso(due),
		};
		db.invoices.push(invoice);
		db.activity.unshift({ id: uuid(), user_id: user!.id, action: "invoice_created", created_at: iso(now) });
		return invoiceDto(db, invoice);
	});
	return ok(created, "Invoice created successfully", 201);
});

async function edit(id: string, body: Record<string, unknown>, user: MockUser) {
	const logo = await logoUrl(body.logo);
	return update((db) => {
		const invoice = ownInvoice(db, id, user);
		// Like the live API: anything past draft is locked and reported as not found.
		if (invoice.status !== "draft") throw new HttpError(404, "Invoice not found");
		if (body.invoice_items !== undefined) {
			invoice.items = parseItems(body.invoice_items);
			Object.assign(invoice, totals(invoice.items, Number(body.service_fee) || 0));
			invoice.payment_amount = invoice.total;
		}
		for (const key of ["title", "payer_name", "payer_email", "country", "note", "template_id"] as const) {
			if (body[key] !== undefined && body[key] !== "") invoice[key] = String(body[key]);
		}
		if (body.due_date) invoice.due_date = invoice.payment_expires_at = iso(Date.parse(String(body.due_date)));
		if (logo !== undefined) invoice.logo_url = logo;
		invoice.updated_at = iso(Date.now());
		return invoiceDto(db, invoice);
	});
}

route("PUT", "/invoice/:id", "user", async ({ params, body, user }) => ok(await edit(params.id!, body, user!), "Invoice updated successfully"));
route("POST", "/invoice/:id", "user", async ({ params, body, user }) => ok(await edit(params.id!, body, user!), "Invoice updated successfully"));

route("GET", "/invoice/stats", "user", ({ user }) => {
	const mine = read().invoices.filter((i) => i.user_id === user!.id);
	const count = (s: InvoiceStatus[]) => mine.filter((i) => s.includes(i.status)).length;
	return ok({
		pending_count: count(["sent", "viewed"]),
		paid_count: count(["paid"]),
		overdue_count: 0,
		expired_count: count(["expired"]),
		invalid_payment_count: count(["invalid_payment"]),
		total_count: mine.length,
	});
});

route("GET", "/invoice/overview", "user", ({ query, user }) => {
	const month = MONTHS.indexOf(String(query.get("month") ?? MONTHS[new Date().getMonth()]).toLowerCase());
	const year = new Date().getFullYear();
	const inMonth = read().invoices.filter((i) => {
		const d = new Date(i.created_at);
		return i.user_id === user!.id && d.getMonth() === month && d.getFullYear() === year;
	});
	const counts = new Map<string, number>();
	for (const i of inMonth) {
		const label = i.status === "viewed" ? "Pending" : i.status.charAt(0).toUpperCase() + i.status.slice(1);
		counts.set(label, (counts.get(label) ?? 0) + 1);
	}
	return ok([...counts].map(([status, value]) => ({ status, value })));
});

/** Public: the client's view, by `invoice_url` (or id). Opening a sent invoice marks it viewed. */
route("GET", "/invoice/search", "public", ({ query }) => {
	const url = query.get("url");
	const id = query.get("id");
	if (!!url === !!id) throw new HttpError(400, "You can only provide either 'id' or 'url', not both or none");
	return ok(
		update((db) => {
			const invoice = db.invoices.find((i) => (url ? i.invoice_url === url : i.id === id));
			if (!invoice || invoice.status === "draft") throw new HttpError(404, "invoice not found");
			if (invoice.status === "sent") invoice.status = "viewed";
			const dto = invoiceDto(db, invoice);
			if (dto.createdBy) {
				const { email: _email, phone_number: _phone, ...publicOwner } = dto.createdBy;
				void [_email, _phone];
				return { ...dto, createdBy: publicOwner };
			}
			return dto;
		}),
	);
});

route("POST", "/invoice/review/:id", "public", ({ params, body }) => {
	if (typeof body.approve !== "boolean") throw new HttpError(400, "approve must be true or false");
	const approve = body.approve;
	return ok(
		update((db) => {
			const invoice = db.invoices.find((i) => i.id === params.id);
			if (!invoice || invoice.status === "paid") throw new HttpError(404, "Invoice not found, or either has already been paid for. Thus, cannot be reviewed");
			invoice.approved = approve;
			invoice.review_date = iso(Date.now());
			db.notifications.unshift({
				id: uuid(),
				user_id: invoice.user_id,
				title: "Invoice Review Update",
				body: `${invoice.payer_name} ${approve ? "approved" : "rejected"} ${invoice.invoice_number}.`,
				viewed: false,
				created_at: iso(Date.now()),
			});
			return invoiceDto(db, invoice);
		}),
		approve ? "Invoice approved" : "Invoice rejected",
	);
});

route("POST", "/invoice/send/:id", "user", ({ params, body, user }) => {
	const emails = Array.isArray(body.emails) ? body.emails.map(String) : [];
	if (!emails.length) throw new HttpError(400, "add at least one email address");
	return ok(
		update((db) => {
			const invoice = ownInvoice(db, params.id!, user);
			if (invoice.status === "cancelled" || invoice.status === "paid") throw new HttpError(409, `a ${invoice.status} invoice can't be sent`);
			if (invoice.status === "draft") invoice.status = "sent";
			invoice.updated_at = iso(Date.now());
			db.notifications.unshift({
				id: uuid(),
				user_id: user!.id,
				title: "Invoice sent",
				body: `${invoice.invoice_number} was sent to ${emails.join(", ")}.`,
				viewed: false,
				created_at: iso(Date.now()),
			});
			return invoiceDto(db, invoice);
		}),
		"Invoice sent successfully",
	);
});

route("GET", "/invoice/:id", "user", ({ params, user }) => {
	const db = read();
	return ok(invoiceDto(db, ownInvoice(db, params.id!, user)));
});

route("DELETE", "/invoice/:id", "user", ({ params, user }) => {
	update((db) => {
		const invoice = ownInvoice(db, params.id!, user);
		if (invoice.status === "paid") throw new HttpError(409, "a paid invoice can't be deleted");
		db.invoices = db.invoices.filter((i) => i.id !== invoice.id);
		db.comments = db.comments.filter((c) => c.invoice_id !== invoice.id);
	});
	return ok(null, "Invoice deleted successfully");
});

/** The API verifies the hash on chain; in the demo only a payment the mock has recorded would pass. */
route("PATCH", "/invoice/:id/mark-paid", "user", ({ params, body, user }) => {
	const db = read();
	ownInvoice(db, params.id!, user);
	const known = db.payments.some((p) => p.transaction_hash === body.transaction_hash && p.invoice_id === params.id && p.verification_status === "verified");
	if (!known) throw new HttpError(404, "transaction not found on Stellar");
	return ok(null, "invoice marked as paid");
});

