"use client";

import { Info } from "lucide-react";
import { PayWithWallet } from "@/features/payer-wallet/components/PayWithWallet";
import type { InvoiceType } from "@/features/invoice/types";
import { CopyField } from "@/features/payments/components/CopyField";
import { ExplorerLink } from "@/features/payments/components/ExplorerLink";
import { PaymentQr } from "@/features/payments/components/PaymentQr";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { PaymentSimulator } from "@/features/payments/components/PaymentSimulator";
import { PaymentStatusPanel } from "@/features/payments/components/PaymentStatusPanel";
import { paymentUri } from "@/features/payments/api";
import { usePaymentRequest } from "@/features/payments/hooks";
import { formatAmount } from "@/features/payments/status";
import { formatDate } from "@/lib/helpers";
import { USDC, shortKey } from "@/lib/stellar/config";

/**
 * The customer's payment page: how much, in what, to which wallet, with which memo, and a live status
 * once they've paid. Everything comes from the API's payment request, so the memo shown is the exact
 * reference it matches payments on.
 */
export function PaymentRequest({ invoice }: { invoice: InvoiceType }) {
	const { data: state, dataUpdatedAt: updatedAt, isLoading, isError } = usePaymentRequest(invoice.invoice_url);

	if (isLoading) return <p className="mt-16 animate-pulse text-center text-neutral-900">Loading payment details…</p>;
	if (isError || !state || !state.expectation.recipient) {
		return (
			<p className="mx-auto mt-16 max-w-md rounded-xl bg-warning-50 p-5 text-center text-sm text-warning-800">
				This invoice can&apos;t take payments right now. Please contact the business that sent it.
			</p>
		);
	}

	const expectation = state.expectation;
	const closed = state.status === "paid" || state.status === "cancelled" || state.status === "expired";
	const uri = paymentUri(expectation);

	return (
		<section className="mx-auto mt-10 grid max-w-5xl gap-6 md:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
			<div className="animate-rise space-y-5">
				<div className="rounded-[5px] border border-[#9fb4dd] bg-primary-20 sm:rounded-[10px]">
					<div className="flex flex-col items-center gap-2 border-b border-b-[#9fb4dd]/50 p-6 sm:p-8">
						<p className="text-sm font-bold tracking-wide sm:text-base">AMOUNT DUE</p>
						<p className="text-3xl font-bold tracking-tight text-primary-500 sm:text-4xl">
							{formatAmount(expectation.amount)} <span className="text-xl sm:text-2xl">{expectation.asset.code}</span>
						</p>
						<PaymentStatusBadge status={state.status} />
					</div>
					<dl className="space-y-2 p-6 text-sm sm:text-base">
						<Row label="Invoice reference" value={invoice.invoice_number ?? ""} />
						<Row label="Asset" value={`${expectation.asset.code} (Testnet)`} />
						<Row label="Invoice date" value={formatDate(invoice.created_at || "")} />
						<Row label="Due date" value={formatDate(invoice.due_date || "")} />
						{invoice.createdBy?.business_name && <Row label="Billed by" value={invoice.createdBy.business_name} />}
					</dl>
				</div>

				<div className="flex gap-3 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700">
					<Info size={18} className="mt-0.5 shrink-0" />
					<p>This is a Stellar Testnet payment. Testnet assets have no real value and no real money is transferred.</p>
				</div>
			</div>

			<div className="animate-rise space-y-5" style={{ "--i": 1 } as React.CSSProperties}>
				{!closed && (
					<div className="space-y-5 rounded-xl border border-primary-50 bg-neutral-500 p-4 sm:p-6">
						<h3 className="font-bold sm:text-lg">How to pay</h3>
						<PayWithWallet expectation={expectation} disabled={state.status === "payment_detected"} />
						<p className="flex items-center gap-3 text-xs font-medium tracking-wide text-neutral-900 uppercase before:h-px before:flex-1 before:bg-primary-50 after:h-px after:flex-1 after:bg-primary-50">
							or send it manually
						</p>
						<CopyField
							label="Send to this wallet"
							value={expectation.recipient}
							display={shortKey(expectation.recipient, 10, 8)}
							mono
						/>
						<CopyField
							label="Payment reference / memo (required)"
							value={expectation.reference}
							mono
							hint={
								<>
									Add this as a <strong>text memo</strong>. Without it, the payment can&apos;t be matched to this invoice.
								</>
							}
						/>
						<p className="text-xs text-neutral-900">
							Send exactly {formatAmount(expectation.amount)} {expectation.asset.code} issued by {shortKey(expectation.asset.issuer ?? USDC.issuer)}. Other assets or
							smaller amounts won&apos;t be accepted.
						</p>

						<div className="flex flex-col items-center gap-3 border-t border-primary-50 pt-5 sm:flex-row sm:items-center">
							<PaymentQr value={uri} label="QR code with the payment details for a Stellar wallet" />
							<p className="w-full text-center text-sm text-neutral-900 sm:text-left">
								Or scan this with a Stellar wallet on your phone: the recipient, amount, asset and memo are filled in.
							</p>
						</div>
					</div>
				)}

				<div>
					<h3 className="mb-3 font-bold sm:text-lg">Current status</h3>
					<PaymentStatusPanel state={state} updatedAt={updatedAt} />
				</div>

				{!closed && <PaymentSimulator invoiceId={expectation.invoiceId} />}

				<div className="flex justify-center">
					<ExplorerLink hash={state.payment?.hash} account={state.payment ? undefined : expectation.recipient} className="text-sm">
						View on explorer
					</ExplorerLink>
				</div>
			</div>
		</section>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-wrap justify-between gap-x-5">
			<dt>{label}</dt>
			<dd className="font-bold break-all">{value}</dd>
		</div>
	);
}
