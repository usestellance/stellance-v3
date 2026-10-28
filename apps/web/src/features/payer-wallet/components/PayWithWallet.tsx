"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Loader2, Smartphone, Wallet } from "lucide-react";
import { Button } from "@repo/ui/button";
import type { PaymentExpectation } from "@/features/payments/types";
import { ExplorerLink } from "@/features/payments/components/ExplorerLink";
import { formatAmount } from "@/features/payments/status";
import { useIsPhone } from "@/features/payer-wallet/device";
import {
	PAYER_WALLETS,
	connectPayerWallet,
	disconnectPayerWallet,
	isWalletDismissal,
	preloadWallets,
	signWithPayerWallet,
	walletErrorMessage,
	walletKind,
	walletName,
	type PayerWalletId,
} from "@/features/payer-wallet/kit";
import { PayerPaymentError, buildInvoicePayment, submitInvoicePayment } from "@/features/payer-wallet/pay";
import { usePayerWallet } from "@/features/payer-wallet/store";
import { shortKey } from "@/lib/stellar/config";

type Step = "idle" | "choosing" | "connecting" | "checking" | "signing" | "sending" | "sent";

/**
 * "Pay with a wallet" on the client's payment page: pick a wallet (on a phone, its app opens over
 * WalletConnect), approve the exact payment, and it's sent to Stellar Testnet. The status panel below then
 * shows Stellance detecting and verifying it. The manual details and QR code stay available.
 */
export function PayWithWallet({ expectation, disabled }: { expectation: PaymentExpectation; disabled?: boolean }) {
	const phone = useIsPhone();
	const { address, walletId } = usePayerWallet();
	const [step, setStep] = useState<Step>("idle");
	const [error, setError] = useState<string | null>(null);
	const [hash, setHash] = useState<string | null>(null);
	const [unknownOutcome, setUnknownOutcome] = useState(false);

	// Warm the kit up so the first tap opens the wallet without a long pause.
	useEffect(() => {
		preloadWallets();
	}, []);

	const busy = step === "connecting" || step === "checking" || step === "signing" || step === "sending";
	const amount = `${formatAmount(expectation.amount)} ${expectation.asset.code}`;

	async function pay(id: PayerWalletId) {
		setError(null);
		try {
			let payer = address && walletId === id ? address : null;
			if (!payer) {
				setStep("connecting");
				payer = await connectPayerWallet(id);
			}
			setStep("checking");
			const xdr = await buildInvoicePayment(expectation, payer);
			setStep("signing");
			const signed = await signWithPayerWallet(id, xdr, payer);
			setStep("sending");
			setHash(await submitInvoicePayment(signed));
			setStep("sent");
		} catch (e) {
			if (e instanceof PayerPaymentError && e.outcomeUnknown) setUnknownOutcome(true);
			if (!(e instanceof PayerPaymentError) && isWalletDismissal(e)) {
				setStep(address ? "idle" : "choosing");
				return;
			}
			setError(e instanceof PayerPaymentError ? e.message : walletErrorMessage(e));
			setStep("idle");
		}
	}

	if (step === "sent" && hash) {
		return (
			<div className="animate-pop space-y-2 rounded-lg border border-success-100 bg-success-50 p-4 text-sm text-success-700">
				<p className="flex items-center gap-2 font-bold">
					<CheckCircle2 size={18} /> Payment sent from your wallet
				</p>
				<p>Stellance is checking it against the invoice now; the status below updates on its own.</p>
				<ExplorerLink hash={hash} className="text-sm">
					View the transaction
				</ExplorerLink>
			</div>
		);
	}

	const name = walletName(walletId);
	const statusLine: Record<Step, string> = {
		idle: "",
		choosing: "",
		connecting: phone ? "Opening your wallet app…" : "Connecting to your wallet…",
		checking: "Checking your wallet can make this payment…",
		signing: phone ? `Approve the payment in ${name}. Come back here once it’s done.` : `Approve the payment in ${name}…`,
		sending: "Sending the payment to Stellar…",
		sent: "",
	};

	return (
		<div className="space-y-3">
			{address && walletId && step !== "choosing" ? (
				<div className="space-y-3">
					<Button type="button" className="w-full" disabled={disabled || busy || unknownOutcome} onClick={() => void pay(walletId)}>
						{busy ? <Loader2 className="animate-spin" /> : <Wallet />} Pay {amount} with {name}
					</Button>
					<p className="text-center text-xs text-neutral-900">
						From {shortKey(address, 6, 5)} ·{" "}
						<button
							type="button"
							disabled={busy}
							className="cursor-pointer underline underline-offset-2"
							onClick={() => {
								void disconnectPayerWallet();
								setStep("choosing");
							}}
						>
							Use another wallet
						</button>
					</p>
				</div>
			) : step === "choosing" || busy ? (
				<ul className="space-y-2" aria-label="Choose a Stellar wallet">
					{PAYER_WALLETS.map((w) => (
						<li key={w.id}>
							<button
								type="button"
								disabled={busy || disabled}
								onClick={() => void pay(w.id)}
								className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-primary-50 bg-neutral-500 px-4 py-3 text-left transition-colors hover:border-primary-200 hover:bg-primary-20 disabled:cursor-default disabled:opacity-60"
							>
								<span className="min-w-0">
									<span className="block font-medium">{w.name}</span>
									<span className="block text-xs text-neutral-900">{walletKind(w.id, phone)}</span>
								</span>
								<ChevronRight size={18} className="shrink-0 text-neutral-900" />
							</button>
						</li>
					))}
				</ul>
			) : (
				<Button type="button" className="w-full" disabled={disabled || unknownOutcome} onClick={() => setStep("choosing")}>
					<Wallet /> Pay {amount} with a wallet
				</Button>
			)}

			{busy && (
				<p role="status" className="flex items-center justify-center gap-2 text-center text-sm text-primary-500">
					<Loader2 size={16} className="animate-spin" /> {statusLine[step]}
				</p>
			)}
			{!busy && phone && step === "choosing" && (
				<p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-900">
					<Smartphone size={14} /> Your wallet app opens to approve; the amount and reference are filled in.
				</p>
			)}
			{error && <p role="alert" className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}
		</div>
	);
}
