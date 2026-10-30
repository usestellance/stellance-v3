import {
	type InvoiceStatus,
	type MockActivity,
	type MockComment,
	type MockDb,
	type MockInvoice,
	type MockInvoiceItem,
	type MockNotification,
	type MockPayment,
	type MockTransaction,
	type MockUser,
	type MockWallet,
} from "./db";
import { buildPayment, type Scenario } from "./payments";
import { DAY, USDC_ISSUER, hex, iso, random, round2, stellarAddress, uuid } from "./util";

/**
 * The demo world, dated relative to the first run so "due in 3 days" stays true:
 *   demo@usestellance.com / Password1   merchant with invoices in every state and every payment case
 *   admin@usestellance.com / Password1  admin (apps/admin)
 * plus other merchants so the admin console has something to list.
 */

export const DEMO_PASSWORD = "Password1";
export const DEMO_EMAIL = "demo@usestellance.com";
export const ADMIN_EMAIL = "admin@usestellance.com";

const FIRST_NAMES = ["Amara", "Tunde", "Zainab", "Kwame", "Chiamaka", "Ifeanyi", "Fatima", "Kofi", "Ngozi", "Emeka", "Halima", "Sipho", "Aisha", "Yaw", "Lerato", "Musa"];
const LAST_NAMES = ["Okafor", "Bello", "Mensah", "Adeyemi", "Nwosu", "Diallo", "Okonkwo", "Asante", "Eze", "Abubakar", "Ndlovu", "Ibrahim", "Owusu", "Mokoena", "Balogun", "Kamau"];
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Senegal", "Rwanda"];
const CLIENTS = [
	["Northwind Labs", "billing@northwind.io", "United States"],
	["Helios Digital", "accounts@heliosdigital.co", "United Kingdom"],
	["Bluepeak Ventures", "finance@bluepeak.vc", "Canada"],
	["Kora Health", "ap@korahealth.com", "Kenya"],
	["Sable & Co", "pay@sableco.studio", "Germany"],
	["Lumen Africa", "invoices@lumen.africa", "Nigeria"],
	["Atlas Freight", "ops@atlasfreight.com", "Netherlands"],
	["Quanta Learning", "finance@quanta.edu", "Ghana"],
] as const;
const WORK = [
	["Product design sprint", "per_hour", 45],
	["Landing page build", "per_unit", 600],
	["Brand identity package", "per_unit", 1200],
	["Mobile app QA", "per_hour", 30],
	["Smart contract review", "per_hour", 85],
	["Content strategy", "per_unit", 450],
	["Dashboard UI", "per_unit", 900],
	["API integration", "per_hour", 60],
	["Copywriting (10 pages)", "per_unit", 350],
	["Monthly retainer", "per_unit", 1500],
] as const;

export function buildSeed(version: number): MockDb {
	const rand = random(20261020);
	const now = Date.now();
	const ago = (days: number, hours = 0) => now - days * DAY - hours * 3_600_000;

	const users: MockUser[] = [];
	const wallets: MockWallet[] = [];

	const addUser = (u: Partial<MockUser> & Pick<MockUser, "first_name" | "last_name" | "email">, createdDaysAgo: number, withWallet = true) => {
		const user: MockUser = {
			id: uuid(rand),
			password: DEMO_PASSWORD,
			business_name: `${u.first_name} ${u.last_name} Studio`,
			phone_number: `+234${Math.floor(7_000_000_000 + rand() * 999_999_999)}`,
			country: COUNTRIES[Math.floor(rand() * COUNTRIES.length)]!,
			role: "user",
			email_verified: true,
			is_active: true,
			profile_complete: true,
			pin: null,
			created_at: iso(ago(createdDaysAgo)),
			updated_at: iso(ago(Math.max(0, createdDaysAgo - 3))),
			...u,
		};
		users.push(user);
		if (withWallet) {
			wallets.push({
				id: uuid(rand),
				user_id: user.id,
				address: stellarAddress(rand),
				tag: "wallet_1",
				usdc: 0,
				xlm: 10_000,
				is_primary: true,
				created_at: user.created_at,
			});
		}
		return user;
	};

	const demo = addUser(
		{ first_name: "Damilola", last_name: "Johnson", email: DEMO_EMAIL, business_name: "Damilola Studio", country: "Nigeria", phone_number: "+2348031234567", pin: "1234" },
		120,
	);
	addUser({ first_name: "Stellance", last_name: "Admin", email: ADMIN_EMAIL, business_name: "Stellance", role: "admin" }, 200);
	for (let i = 0; i < 16; i++) {
		const first = FIRST_NAMES[i]!;
		const last = LAST_NAMES[(i * 5) % LAST_NAMES.length]!;
		addUser(
			{
				first_name: first,
				last_name: last,
				email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
				is_active: i !== 6,
				email_verified: i !== 11,
				profile_complete: i !== 11,
			},
			10 + i * 9,
			i !== 11,
		);
	}

	const demoWallet = wallets.find((w) => w.user_id === demo.id)!;

	// ---- Invoices --------------------------------------------------------------------------
	const invoices: MockInvoice[] = [];
	let sequence = 0;
	const addInvoice = (owner: MockUser, status: InvoiceStatus, createdDaysAgo: number, dueInDays: number, clientIndex: number, workIndexes: number[]) => {
		sequence += 1;
		const created = ago(createdDaysAgo);
		const date = new Date(created);
		const number = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${String(sequence).padStart(4, "0")}`;
		const items: MockInvoiceItem[] = workIndexes.map((w, k) => {
			const [description, type, price] = WORK[w % WORK.length]!;
			const quantity = type === "per_hour" ? 8 + ((w + k) % 4) * 4 : 1;
			const discount = k === 1 ? 5 : 0;
			return {
				item_id: uuid(rand),
				invoice_type: type,
				description,
				quantity,
				unit_price: price,
				discount,
				amount: round2(quantity * price * (1 - discount / 100)),
				created_at: iso(created),
			};
		});
		const sub_total = round2(items.reduce((s, i) => s + i.amount, 0));
		// The merchant carries the Stellance fee, so nothing is added to what the client pays.
		const service_fee = 0;
		const total = round2(sub_total + service_fee);
		const [client, email, country] = CLIENTS[clientIndex % CLIENTS.length]!;
		const due = created + dueInDays * DAY;
		const invoice: MockInvoice = {
			id: uuid(rand),
			user_id: owner.id,
			invoice_number: number,
			invoice_url: hex(30, rand),
			title: items[0]!.description,
			payer_email: email,
			payer_name: client,
			country,
			sub_total,
			service_fee,
			total,
			currency: "usdc",
			status,
			due_date: iso(due),
			created_at: iso(created),
			updated_at: iso(created + 3_600_000),
			items,
			approved: status !== "draft" && status !== "sent",
			review_date: status !== "draft" && status !== "sent" ? iso(created + 6 * 3_600_000) : null,
			template_id: `template_00${(sequence % 5) + 1}`,
			logo_url: null,
			note: "Thank you for your business. Please include the payment reference as the memo.",
			payment_reference: `STL-${hex(12, rand).toUpperCase()}`,
			payment_asset_code: "USDC",
			payment_asset_issuer: USDC_ISSUER,
			payment_amount: total,
			payment_expires_at: iso(due),
		};
		invoices.push(invoice);
		return invoice;
	};

	// Demo merchant: every state the PRD names.
	const paid1 = addInvoice(demo, "paid", 96, 14, 0, [0, 1]);
	const paid2 = addInvoice(demo, "paid", 74, 14, 1, [2]);
	const paid3 = addInvoice(demo, "paid", 45, 10, 2, [3, 4]);
	const paid4 = addInvoice(demo, "paid", 12, 14, 3, [6]);
	const insufficient = addInvoice(demo, "invalid_payment", 9, 12, 4, [5, 7]);
	const wrongAsset = addInvoice(demo, "invalid_payment", 7, 14, 5, [1]);
	const awaiting = addInvoice(demo, "sent", 2, 14, 6, [8, 9]);
	addInvoice(demo, "viewed", 4, 10, 7, [7]);
	const overdueFailed = addInvoice(demo, "invalid_payment", 40, 14, 1, [9]);
	addInvoice(demo, "expired", 33, 7, 2, [4, 8]);
	addInvoice(demo, "draft", 1, 14, 3, [0]);
	addInvoice(demo, "draft", 0, 21, 4, [2, 5]);
	addInvoice(demo, "cancelled", 60, 14, 5, [3]);

	// Other merchants (admin console).
	const statuses: InvoiceStatus[] = ["paid", "sent", "viewed", "expired", "draft", "cancelled", "paid"];
	users
		.filter((u) => u.role === "user" && u.id !== demo.id && u.profile_complete)
		.forEach((u, i) => {
			addInvoice(u, statuses[i % statuses.length]!, 5 + i * 4, 14, i, [i, i + 3]);
			if (i % 2 === 0) addInvoice(u, statuses[(i + 3) % statuses.length]!, 2 + i * 3, 10, i + 2, [i + 1]);
		});

	// ---- Payments (verification results) --------------------------------------------------
	const payments: MockPayment[] = [];
	const settled = new Set<string>();
	const demoInvoices = invoices.filter((i) => i.user_id === demo.id);
	const pay = (scenario: Scenario, invoice: MockInvoice | null, hoursAfterCreate: number) => {
		const at = invoice ? Date.parse(invoice.created_at) + hoursAfterCreate * 3_600_000 : ago(0, hoursAfterCreate);
		const p = buildPayment({ scenario, invoice, invoices: demoInvoices, wallet: demoWallet, at, rand, settledInvoiceIds: settled });
		if (p.verification_status === "verified" && p.invoice_id) settled.add(p.invoice_id);
		payments.push(p);
		return p;
	};
	pay("correct", paid1, 30);
	pay("correct", paid2, 50);
	pay("insufficient", paid3, 20);
	pay("correct", paid3, 26);
	pay("correct", paid4, 40);
	pay("duplicate", paid4, 44);
	pay("insufficient", insufficient, 30);
	pay("wrong_asset", wrongAsset, 20);
	pay("failed", overdueFailed, 100);
	pay("unknown_memo", null, 30);
	pay("no_memo", null, 70);
	void awaiting; // left awaiting payment on purpose
	payments.sort((a, b) => b.detected_at.localeCompare(a.detected_at));

	// ---- Wallet ledger ---------------------------------------------------------------------
	const transactions: MockTransaction[] = [];
	for (const w of wallets) {
		transactions.push({
			id: uuid(rand),
			user_id: w.user_id,
			wallet_id: w.id,
			transaction_hash: hex(64, rand),
			amount: 10_000,
			currency: "xlm",
			status: "confirmed",
			network_fee: 0,
			created_at: w.created_at,
			confirmed_at: w.created_at,
			token_type: "native",
			transaction_type: "funding",
			invoice_number: "",
		});
	}
	for (const p of payments) {
		transactions.push({
			id: uuid(rand),
			user_id: demo.id,
			wallet_id: demoWallet.id,
			transaction_hash: p.transaction_hash,
			amount: p.amount,
			currency: p.asset_code === "XLM" ? "xlm" : "usdc",
			status: p.transaction_successful ? "confirmed" : "failed",
			network_fee: 0,
			created_at: p.detected_at,
			confirmed_at: p.detected_at,
			token_type: p.asset_code === "XLM" ? "native" : "usdc",
			transaction_type: "payment",
			invoice_number: p.invoice_number ?? "",
			invoice_id: p.invoice_id ?? undefined,
		});
		if (!p.transaction_successful) continue;
		if (p.asset_code === "XLM") demoWallet.xlm += p.amount;
		else demoWallet.usdc = round2(demoWallet.usdc + p.amount);
	}
	transactions.push({
		id: uuid(rand),
		user_id: demo.id,
		wallet_id: demoWallet.id,
		transaction_hash: hex(64, rand),
		amount: 500,
		currency: "usdc",
		status: "confirmed",
		network_fee: 0.00001,
		created_at: iso(ago(20)),
		confirmed_at: iso(ago(20)),
		token_type: "credit_alphanum4",
		transaction_type: "path_payment",
		invoice_number: "",
		source_amount: "500.000000",
		source_asset: "USDC",
	});
	demoWallet.usdc = round2(demoWallet.usdc - 500);
	transactions.sort((a, b) => b.created_at.localeCompare(a.created_at));

	// ---- Comments, notifications, activity -------------------------------------------------
	const comments: MockComment[] = [
		{ invoice: insufficient, name: insufficient.payer_name, email: insufficient.payer_email, text: "We sent part of this today; the rest follows next week.", hours: 28, guest: true },
		{ invoice: insufficient, name: "Damilola", email: DEMO_EMAIL, text: "Thanks! The invoice stays open until the full amount arrives.", hours: 31, guest: false },
		{ invoice: wrongAsset, name: wrongAsset.payer_name, email: wrongAsset.payer_email, text: "Paid in XLM, hope that works.", hours: 21, guest: true },
		{ invoice: wrongAsset, name: "Damilola", email: DEMO_EMAIL, text: "This invoice needs USDC (Testnet). Could you resend in USDC with the memo?", hours: 23, guest: false },
		{ invoice: paid1, name: paid1.payer_name, email: paid1.payer_email, text: "Approved. Paying now.", hours: 20, guest: true },
	].map((c) => ({
		id: uuid(rand),
		invoice_id: c.invoice.id,
		user_id: c.guest ? null : demo.id,
		commenter_name: c.name,
		commenter_email: c.email,
		comment_text: c.text,
		parent_comment_id: null,
		is_guest: c.guest,
		created_at: iso(Date.parse(c.invoice.created_at) + c.hours * 3_600_000),
	}));

	const notifications: MockNotification[] = [
		["Invoice Paid", `Payment for invoice ${paid4.invoice_number} was verified on Stellar.`, 11, false],
		["Payment needs review", `A payment for ${insufficient.invoice_number} was smaller than the invoice amount. The invoice stays unpaid.`, 7, false],
		["Payment needs review", `A payment for ${wrongAsset.invoice_number} used the wrong asset (XLM instead of USDC).`, 6, false],
		["Unmatched payment", "A payment arrived without a matching invoice reference. Review it under Transactions → Invoice payments.", 2, false],
		["Invoice Review Update", `${insufficient.payer_name} approved ${insufficient.invoice_number}.`, 8, true],
		["Invoice sent", `${awaiting.invoice_number} was sent to ${awaiting.payer_email}.`, 2, true],
		["Invoice expired", `The payment window for ${overdueFailed.invoice_number} has closed.`, 25, true],
		["Invoice Paid", `Payment for invoice ${paid3.invoice_number} was verified on Stellar.`, 43, true],
	].map(([title, body, days, viewed]) => ({
		id: uuid(rand),
		user_id: demo.id,
		title: title as string,
		body: body as string,
		viewed: viewed as boolean,
		created_at: iso(ago(days as number)),
	}));

	const activity: MockActivity[] = [];
	for (const u of users) {
		for (let k = 0; k < 6; k++) {
			activity.push({
				id: uuid(rand),
				user_id: u.id,
				action: ["login", "login", "invoice_created", "invoice_sent", "profile_updated", "login"][k]!,
				created_at: iso(ago(k * 3 + (u.role === "admin" ? 0 : 1), k)),
			});
		}
	}

	return {
		version,
		seededAt: iso(now),
		users,
		wallets,
		invoices,
		comments,
		notifications,
		transactions,
		payments,
		activity,
		network: "testnet",
	};
}
