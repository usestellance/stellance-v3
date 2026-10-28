"use client";

import type { PaymentExpectation } from "@/features/payments/types";
import { HORIZON_URL, NETWORK_PASSPHRASE, USDC } from "@/lib/stellar/config";

/**
 * The client pays an invoice from their own wallet: the exact payment the API's request asks for (recipient,
 * asset code + issuer, amount, the STL- reference as a text memo) is built here, signed in the wallet and
 * submitted to Testnet. The API then detects and verifies it like any other payment; nothing here marks the
 * invoice paid.
 */

/** Why a payment can't be made from this wallet, in words the payer can act on. */
export class PayerPaymentError extends Error {
	constructor(
		message: string,
		/** The payment may already be on the network: never offer to pay again. */
		readonly outcomeUnknown = false,
	) {
		super(message);
	}
}

const sdk = () => import("@stellar/stellar-sdk");

/** Builds the payment as an unsigned transaction (base64 XDR), after checking the payer can make it. */
export async function buildInvoicePayment(expectation: PaymentExpectation, payer: string) {
	const { Asset, BASE_FEE, Horizon, Memo, Operation, TransactionBuilder } = await sdk();
	const server = new Horizon.Server(HORIZON_URL);
	const issuer = expectation.asset.issuer ?? USDC.issuer;
	const native = expectation.asset.code === "XLM" && !expectation.asset.issuer;
	const asset = native ? Asset.native() : new Asset(expectation.asset.code, issuer);
	const amount = expectation.amount.toFixed(7);

	let account: Awaited<ReturnType<typeof server.loadAccount>>;
	try {
		account = await server.loadAccount(payer);
	} catch (error) {
		if ((error as { response?: { status?: number } })?.response?.status === 404) {
			throw new PayerPaymentError("This wallet isn’t active on Stellar Testnet yet. Fund it with test XLM (Friendbot) and add USDC, then try again.");
		}
		throw new PayerPaymentError("Stellar Testnet couldn’t be reached. Check your connection and try again.");
	}

	if (!native) {
		const line = account.balances.find(
			(b) => "asset_code" in b && b.asset_code === expectation.asset.code && "asset_issuer" in b && b.asset_issuer === issuer,
		);
		if (!line) throw new PayerPaymentError(`This wallet doesn’t hold ${expectation.asset.code} (Testnet) yet. Add the ${expectation.asset.code} asset in your wallet, then try again.`);
		if (Number(line.balance) < expectation.amount) {
			throw new PayerPaymentError(`Not enough ${expectation.asset.code}: this wallet has ${Number(line.balance).toFixed(2)}, the invoice is ${expectation.amount.toFixed(2)}.`);
		}
	}

	const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
		.addOperation(Operation.payment({ destination: expectation.recipient, asset, amount }))
		.addMemo(Memo.text(expectation.reference))
		.setTimeout(300)
		.build();
	return tx.toXDR();
}

/** Submits the signed payment; resolves with its hash. A lost response is reported as "check the status", never retried. */
export async function submitInvoicePayment(signedXdr: string) {
	const { Horizon, TransactionBuilder } = await sdk();
	const server = new Horizon.Server(HORIZON_URL);
	const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
	try {
		const result = await server.submitTransaction(tx);
		return result.hash;
	} catch (error) {
		const response = (error as { response?: { status?: number; data?: { extras?: { result_codes?: { transaction?: string; operations?: string[] } } } } })?.response;
		const codes = response?.data?.extras?.result_codes;
		if (codes) {
			const op = codes.operations?.[0];
			if (op === "op_underfunded") throw new PayerPaymentError("Not enough funds in this wallet for the payment.");
			if (op === "op_no_trust" || op === "op_src_no_trust") throw new PayerPaymentError("This wallet doesn’t hold the invoice’s asset yet. Add it in your wallet, then try again.");
			if (op === "op_no_destination") throw new PayerPaymentError("The business’s wallet isn’t active on Testnet. Please contact them.");
			if (codes.transaction === "tx_bad_seq") throw new PayerPaymentError("The wallet’s account changed while signing. Please try again.");
			if (codes.transaction === "tx_too_late") throw new PayerPaymentError("The signing window expired. Please try again.");
			throw new PayerPaymentError(`Stellar rejected the payment (${op ?? codes.transaction}). Nothing was sent.`);
		}
		// No answer (timeout, 5xx, network): the payment may have landed. Never resubmit blindly.
		throw new PayerPaymentError("We couldn’t confirm the payment was sent. Check the status below before paying again.", true);
	}
}
