import { type MockInvoice, type MockPayment, type MockWallet, type VerificationStatus } from "./db";
import { USDC_ISSUER, hex, iso, operationId, stellarAddress } from "./util";

/**
 * How the mock "backend" verifies a payment. The same rules as the app's `features/payments/verify.ts`
 * and the PRD: recipient, asset (code + issuer), amount, reference, transaction success, invoice match,
 * and a second valid payment for a settled invoice is held as a duplicate.
 */

export const SCENARIOS = ["correct", "insufficient", "wrong_asset", "no_memo", "unknown_memo", "failed", "duplicate"] as const;
export type Scenario = (typeof SCENARIOS)[number];

interface Observed {
	sender: string;
	recipient: string;
	asset_code: string;
	asset_issuer: string | null;
	amount: number;
	memo: string | null;
	successful: boolean;
}

function observe(scenario: Scenario, invoice: MockInvoice | null, wallet: MockWallet, rand: () => number): Observed {
	const amount = invoice?.payment_amount ?? 250;
	const base: Observed = {
		sender: stellarAddress(rand),
		recipient: wallet.address,
		asset_code: "USDC",
		asset_issuer: USDC_ISSUER,
		amount,
		memo: invoice?.payment_reference ?? null,
		successful: true,
	};
	switch (scenario) {
		case "insufficient":
			return { ...base, amount: Math.round((amount / 2) * 100) / 100 };
		case "wrong_asset":
			return { ...base, asset_code: "XLM", asset_issuer: null };
		case "no_memo":
			return { ...base, memo: null };
		case "unknown_memo":
			return { ...base, memo: "INV-UNKNOWN-0001" };
		case "failed":
			return { ...base, successful: false };
		default:
			return base;
	}
}

export function verify(observed: Observed, invoices: MockInvoice[], settledInvoiceIds: Set<string>) {
	const memo = observed.memo?.trim() || null;
	const invoice = memo ? invoices.find((i) => i.payment_reference.toUpperCase() === memo.toUpperCase()) : undefined;
	const reasons: string[] = [];
	const checks: MockPayment["checks"] = {
		recipient: "skip",
		asset: "skip",
		amount: "skip",
		reference: memo ? "pass" : "fail",
		success: observed.successful ? "pass" : "fail",
		invoice: invoice ? "pass" : "fail",
	};
	if (!observed.successful) reasons.push("transaction_failed");
	if (!invoice) {
		reasons.push(memo ? "unknown_reference" : "missing_reference");
		if (memo) checks.reference = "fail";
	} else {
		checks.recipient = "pass";
		checks.asset = observed.asset_code === invoice.payment_asset_code && observed.asset_issuer === invoice.payment_asset_issuer ? "pass" : "fail";
		checks.amount = Math.round(observed.amount * 1e7) >= Math.round(invoice.payment_amount * 1e7) ? "pass" : "fail";
		if (checks.asset === "fail") reasons.push("wrong_asset");
		if (checks.amount === "fail") reasons.push("insufficient_amount");
	}
	let status: VerificationStatus = !observed.successful ? "failed" : !invoice ? "unmatched" : reasons.length ? "invalid" : "verified";
	if (status === "verified" && invoice && settledInvoiceIds.has(invoice.id)) {
		status = "invalid";
		reasons.push("duplicate");
	}
	return { status, reasons, checks, invoice };
}

/** A payment record for `scenario`, already checked. `settleAfterMs` keeps it "detected" for a while. */
export function buildPayment({
	scenario,
	invoice,
	invoices,
	wallet,
	at,
	rand,
	settledInvoiceIds,
	settleAfterMs = 0,
}: {
	scenario: Scenario;
	invoice: MockInvoice | null;
	invoices: MockInvoice[];
	wallet: MockWallet;
	at: number;
	rand: () => number;
	settledInvoiceIds: Set<string>;
	settleAfterMs?: number;
}): MockPayment {
	const observed = observe(scenario, invoice, wallet, rand);
	const result = verify(observed, invoices, settledInvoiceIds);
	const matched = result.invoice ?? null;
	const pending = settleAfterMs > 0;

	return {
		id: operationId(rand),
		user_id: wallet.user_id,
		transaction_hash: hex(64, rand),
		sender: observed.sender,
		recipient: observed.recipient,
		asset_code: observed.asset_code,
		asset_issuer: observed.asset_issuer,
		amount: observed.amount,
		payment_reference: observed.memo,
		transaction_successful: observed.successful,
		verification_status: pending ? "detected" : result.status,
		resolves_to: result.status,
		settles_at: pending ? at + settleAfterMs : undefined,
		reasons: result.reasons,
		checks: result.checks,
		invoice_id: matched?.id ?? null,
		invoice_number: matched?.invoice_number ?? null,
		expected: matched
			? {
					amount: matched.payment_amount,
					asset_code: matched.payment_asset_code,
					asset_issuer: matched.payment_asset_issuer,
					recipient: wallet.address,
					payment_reference: matched.payment_reference,
				}
			: null,
		detected_at: iso(at),
		verified_at: !pending && result.status === "verified" ? iso(at + 2_000) : null,
	};
}
