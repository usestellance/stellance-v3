"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Download, ExternalLink, Loader2, RotateCw, Smartphone, Wallet } from "lucide-react";
import { Button } from "@repo/ui/button";
import type { PaymentExpectation } from "@/features/payments/types";
import { ExplorerLink } from "@/features/payments/components/ExplorerLink";
import { formatAmount } from "@/features/payments/status";
import { isPhone, useIsInVarialApp, useIsPhone } from "@/features/payer-wallet/device";
import {
	PAYER_WALLETS,
	WalletNotInstalledError,
	cancelWalletPairing,
	connectPayerWallet,
	disconnectPayerWallet,
	hasApp,
	installLink,
	isExtensionInstalled,
	isWalletDismissal,
	needsExtension,
	openWalletApp,
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
 *
 * On a laptop the page checks for Varial's extension and offers the install link when it's missing. On a
 * phone it can't ask which apps are installed, so it opens the app and offers the install link if the page
 * is still in front a moment later.
 */
export function PayWithWallet({ expectation, disabled }: { expectation: PaymentExpectation; disabled?: boolean }) {
	const phone = useIsPhone();
	const inVarial = useIsInVarialApp();
	const { address, walletId } = usePayerWallet();
	const [step, setStep] = useState<Step>("idle");
	const [error, setError] = useState<string | null>(null);
	const [hash, setHash] = useState<string | null>(null);
	const [unknownOutcome, setUnknownOutcome] = useState(false);
	/** Varial's browser extension: undefined until checked (laptops only). */
	const [extensionFound, setExtensionFound] = useState<boolean | undefined>(undefined);
	/** The wallet to offer the install link for: its extension is missing, or its app didn't open. */
	const [missing, setMissing] = useState<PayerWalletId | null>(null);

	// Warm the kit up so the first tap opens the wallet without a long pause, and look for Varial's extension.
	useEffect(() => {
		preloadWallets();
		if (isPhone()) return;
		void isExtensionInstalled("freighter")
			.then(setExtensionFound)
			.catch(() => setExtensionFound(false));
	}, []);

	const busy = step === "connecting" || step === "checking" || step === "signing" || step === "sending";
	const amount = `${formatAmount(expectation.amount)} ${expectation.asset.code}`;

	async function pay(id: PayerWalletId) {
		setError(null);
		setMissing(null);
		if (needsExtension(id, phone) && extensionFound === false) {
			setMissing(id);
			setStep("choosing");
			return;
		}
		try {
			let payer = address && walletId === id ? address : null;
			if (!payer) {
				setStep("connecting");
				payer = await connectPayerWallet(id, { onAppMissed: () => setMissing(id) });
				setMissing(null);
			}
			setStep("checking");
			const xdr = await buildInvoicePayment(expectation, payer);
			setStep("signing");
			const signed = await signWithPayerWallet(id, xdr, payer);
			setStep("sending");
			setHash(await submitInvoicePayment(signed));
			setStep("sent");
		} catch (e) {
			if (e instanceof WalletNotInstalledError) {
				setExtensionFound(false);
				setMissing(e.walletId);
				setStep("choosing");
				return;
			}
			setMissing(null);
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

	/** The row's second line: whether this device has the wallet, when the page can tell. */
	function rowDetail(id: PayerWalletId) {
		if (id === "freighter" && inVarial) return <span className="text-success-600">Detected · you’re in Varial</span>;
		const kind = walletKind(id, phone);
		if (!needsExtension(id, phone) || extensionFound === undefined) return kind;
		return extensionFound ? <span className="text-success-600">{kind} · detected</span> : <span>{kind} · not installed</span>;
	}

	const phoneApp = phone && !inVarial && walletId && hasApp(walletId) ? walletId : null;

	return (
		<div className="space-y-3">
			{address && walletId && step !== "choosing" ? (
				<div className="space-y-3">
					<Button
						type="button"
						className="w-full"
						disabled={disabled || busy || unknownOutcome}
						onClick={() => void pay(walletId)}
					>
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
									<span className="block text-xs text-neutral-900">{rowDetail(w.id)}</span>
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

			{missing && (
				<InstallPrompt
					walletId={missing}
					phone={phone}
					onRetry={() => openWalletApp(missing, () => setMissing(missing))}
					onCancel={() => {
						setMissing(null);
						cancelWalletPairing();
					}}
				/>
			)}

			{busy && !missing && (
				<div role="status" className="space-y-2 text-center text-sm text-primary-500">
					<p className="flex items-center justify-center gap-2">
						<Loader2 size={16} className="animate-spin" /> {statusLine[step]}
					</p>
					{step === "signing" && phoneApp && (
						<button
							type="button"
							className="inline-flex cursor-pointer items-center gap-1 text-xs underline underline-offset-2"
							onClick={() => openWalletApp(phoneApp)}
						>
							<ExternalLink size={12} /> Open {walletName(phoneApp)}
						</button>
					)}
				</div>
			)}
			{!busy && phone && step === "choosing" && !missing && (
				<p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-xs text-neutral-900">
					<Smartphone size={14} /> Your wallet app opens to approve; the amount and reference are filled in.
					{!inVarial && <GetAppLink walletId="freighter" />}
				</p>
			)}
			{error && (
				<p role="alert" className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">
					{error}
				</p>
			)}
		</div>
	);
}

/** "No wallet app yet? Get Varial", to the phone's app store. */
function GetAppLink({ walletId }: { walletId: PayerWalletId }) {
	const link = installLink(walletId, true);
	if (!link) return null;
	return (
		<span>
			No wallet app yet?{" "}
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				className="font-medium text-primary-500 underline underline-offset-2"
			>
				Get {walletName(walletId)}
			</a>
		</span>
	);
}

/**
 * The wallet isn't on this device: on a laptop its extension is missing (installing it needs a reload, since
 * extensions only reach pages opened after them); on a phone its app didn't open, which usually means it
 * isn't installed. The connection keeps waiting on a phone, so "Open again" can still finish it.
 */
function InstallPrompt({
	walletId,
	phone,
	onRetry,
	onCancel,
}: {
	walletId: PayerWalletId;
	phone: boolean;
	onRetry: () => void;
	onCancel: () => void;
}) {
	const name = walletName(walletId);
	const link = installLink(walletId, phone);
	return (
		<div role="alert" className="animate-pop space-y-3 rounded-lg border border-warning-100 bg-warning-50 p-4 text-sm">
			<div className="space-y-1">
				<p className="font-bold text-black-500">{phone ? `${name} didn’t open` : `${name} isn’t installed in this browser`}</p>
				<p className="text-neutral-900">
					{phone
						? `${name} may not be on this phone yet. Get the app, set up a wallet, then come back and open it.`
						: `Add the ${name} extension, then reload this page to pay with it. Or choose another wallet above.`}
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				{link && (
					<Button asChild size="sm">
						<a href={link.href} target="_blank" rel="noopener noreferrer">
							<Download /> Get {name} · {link.store}
						</a>
					</Button>
				)}
				{phone ? (
					<Button type="button" variant="outline" size="sm" onClick={onRetry}>
						<RotateCw /> Open {name} again
					</Button>
				) : (
					<Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
						<RotateCw /> I’ve installed it
					</Button>
				)}
				{phone && (
					<button
						type="button"
						className="cursor-pointer px-2 text-xs text-neutral-900 underline underline-offset-2"
						onClick={onCancel}
					>
						Cancel
					</button>
				)}
			</div>
		</div>
	);
}
