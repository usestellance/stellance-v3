import Link from "next/link";
import { ExplorerLink } from "@/features/payments/components/ExplorerLink";
import { PaymentTimeline } from "@/features/payments/components/PaymentTimeline";
import { StatusIcon } from "@/features/payments/components/StatusIcon";
import { PAYMENT_STATUS, formatAmount, formatDateTime, reasonCopy } from "@/features/payments/status";
import type { InvoicePaymentState } from "@/features/payments/types";
import { shortKey } from "@/lib/stellar/config";

/**
 * "What is happening with this payment": the state, the progress line and, once a transaction exists,
 * its hash and why it did or didn't count. `paymentHref` links the transaction to its detail page
 * (merchant only; the customer sees the explorer link).
 */
export function PaymentStatusPanel({
	state,
	paymentHref,
	updatedAt,
}: {
	state: InvoicePaymentState;
	paymentHref?: (id: string) => string;
	updatedAt?: number;
}) {
	const meta = PAYMENT_STATUS[state.status];
	const payment = state.payment;
	const unsettled = payment && payment.status !== "verified" && payment.status !== "detected";
	const problems = unsettled
		? payment.reasons.length
			? payment.reasons.map((reason) => reasonCopy(reason, payment, state.expectation))
			: payment.failureReason
				? [{ title: "Not accepted", detail: payment.failureReason }]
				: []
		: [];

	return (
		<div className="rounded-xl border border-primary-50 bg-neutral-500 p-4 sm:p-6">
			<div className="flex items-start gap-4" aria-live="polite">
				<StatusIcon status={state.status} />
				<div className="min-w-0">
					<p key={state.status} className="animate-pop font-semibold text-primary-500 sm:text-lg">
						{meta.title}
					</p>
					<p className="mt-1 text-sm text-neutral-900">{meta.description}</p>
				</div>
			</div>

			{state.status !== "cancelled" && state.status !== "expired" && (
				<div className="mt-6">
					<PaymentTimeline status={state.status} />
				</div>
			)}

			{problems.length > 0 && (
				<ul className="mt-6 space-y-2">
					{problems.map((copy) => (
						<li key={copy.title} className="animate-rise rounded-lg bg-error-50 px-4 py-3 text-sm">
							<p className="font-medium text-error-500">{copy.title}</p>
							<p className="mt-0.5 text-error-500/80">{copy.detail}</p>
						</li>
					))}
				</ul>
			)}

			{payment && (
				<dl className="mt-6 grid gap-3 border-t border-primary-50 pt-5 text-sm sm:grid-cols-2">
					<div className="min-w-0">
						<dt className="text-neutral-900">Transaction</dt>
						<dd className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
							{paymentHref ? (
								<Link href={paymentHref(payment.id)} className="font-mono text-primary-500 underline-offset-4 hover:underline">
									{shortKey(payment.hash, 8, 6)}
								</Link>
							) : (
								<span className="font-mono">{shortKey(payment.hash, 8, 6)}</span>
							)}
							<ExplorerLink hash={payment.hash} className="text-xs">
								Explorer
							</ExplorerLink>
						</dd>
					</div>
					<div>
						<dt className="text-neutral-900">Received</dt>
						<dd className="mt-1 font-medium">
							{formatAmount(payment.amount)} {payment.asset.code}
						</dd>
					</div>
					<div>
						<dt className="text-neutral-900">Detected</dt>
						<dd className="mt-1 font-medium">{formatDateTime(payment.detectedAt)}</dd>
					</div>
					<div>
						<dt className="text-neutral-900">Verified</dt>
						<dd className="mt-1 font-medium">{payment.status === "verified" ? formatDateTime(payment.verifiedAt) : "—"}</dd>
					</div>
				</dl>
			)}

			{meta.live && updatedAt ? (
				<p className="mt-5 text-xs text-neutral-900">
					Stellance checks Stellar Testnet automatically · last updated{" "}
					{new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(updatedAt)}
				</p>
			) : null}
		</div>
	);
}
