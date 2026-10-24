"use client";

import clsx from "clsx";
import Link from "next/link";
import { CircleAlert, CircleX, ShieldAlert } from "lucide-react";
import { Button } from "@repo/ui/button";
import GoBack from "@/components/GoBack";
import { StatusBadge } from "@/components/InvoiceStatusBadge";
import { CopyField } from "@/features/payments/components/CopyField";
import { ExplorerLink } from "@/features/payments/components/ExplorerLink";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { VerificationChecklist } from "@/features/payments/components/VerificationChecklist";
import { useGetInvoice } from "@/features/invoice/hooks";
import type { InvoiceType } from "@/features/invoice/types";
import { useInvoicePayment, usePayment } from "@/features/payments/hooks";
import { formatAmount, formatDateTime, reasonCopy } from "@/features/payments/status";
import type { DetectedPayment } from "@/features/payments/types";
import { USDC, shortKey } from "@/lib/stellar/config";
import { invoiceRoutes, transactionsRoutes } from "@/lib/routes";

/** One received payment: verified (transaction details), invalid, unmatched or failed. */
export function PaymentDetails({ paymentId }: { paymentId: string }) {
	const { payment, isLoading, isError } = usePayment(paymentId);
	const { data: invoiceData } = useGetInvoice({ invoice_id: payment?.invoiceId ?? "" });
	const invoice = payment?.invoiceId ? (invoiceData as InvoiceType | undefined) : undefined;
	const { data: request } = useInvoicePayment(payment?.invoiceId ?? undefined, { poll: false });
	const problems = !payment
		? []
		: payment.reasons.length
			? payment.reasons.map((reason) => reasonCopy(reason, payment, request?.expectation))
			: payment.failureReason
				? [{ title: "Not accepted", detail: payment.failureReason }]
				: [];

	return (
		<div className="custom-container mx-auto max-w-3xl pt-5 pb-20 md:pt-10">
			<GoBack />

			{isLoading && <p className="mt-20 animate-pulse text-center text-neutral-900">Loading payment…</p>}
			{!isLoading && (isError || !payment) && <p className="mt-20 text-center sm:text-lg">Unable to find this payment.</p>}

			{payment && (
				<div className="mt-8 space-y-6 md:mt-10">
					<Header payment={payment} />

					{problems.length > 0 && (
						<section className="animate-rise rounded-xl border border-primary-50 p-4 sm:p-6" style={{ "--i": 1 } as React.CSSProperties}>
							<h3 className="font-semibold">Verification result</h3>
							<ul className="mt-4 space-y-3">
								{problems.map((copy) => {
									return (
										<li key={copy.title} className="flex gap-3 rounded-lg bg-error-50 p-4">
											<CircleX size={20} className="mt-0.5 shrink-0 text-error-400" />
											<div>
												<p className="font-medium text-error-500">{copy.title}</p>
												<p className="mt-0.5 text-sm text-error-500/80">{copy.detail}</p>
											</div>
										</li>
									);
								})}
							</ul>
						</section>
					)}

					<section
						className="animate-rise rounded-xl border border-primary-50 bg-primary-20 p-4 sm:p-6"
						style={{ "--i": 2 } as React.CSSProperties}
					>
						<h3 className="font-semibold">Transaction summary</h3>
						<CopyField label="Transaction hash" value={payment.hash} display={shortKey(payment.hash, 10, 10)} mono className="mt-4" />
						<dl className="mt-4">
							<Detail label="Amount" value={`${formatAmount(payment.amount)} ${payment.asset.code}`} />
							<Detail label="Asset" value={payment.asset.code === USDC.code && payment.asset.issuer === USDC.issuer ? USDC.label : payment.asset.issuer ? `${payment.asset.code} · ${shortKey(payment.asset.issuer)}` : "XLM (native)"} />
							<Detail label="Sender wallet" value={shortKey(payment.sender, 8, 6)} title={payment.sender} />
							<Detail label="Recipient wallet" value={shortKey(payment.recipient, 8, 6)} title={payment.recipient} />
							<Detail label="Payment reference" value={payment.memo ?? "No reference found"} />
							<Detail label="Detected at" value={formatDateTime(payment.detectedAt)} />
							<Detail label="Verified at" value={payment.status === "verified" ? formatDateTime(payment.verifiedAt) : "—"} />
							<div className="flex flex-col justify-between gap-1 pt-4 sm:flex-row">
								<dt className="text-neutral-900">Explorer link</dt>
								<dd>
									<ExplorerLink hash={payment.hash} />
								</dd>
							</div>
						</dl>
					</section>

					<section className="animate-rise rounded-xl border border-primary-50 p-4 sm:p-6" style={{ "--i": 3 } as React.CSSProperties}>
						<h3 className="font-semibold">Verification results</h3>
						<div className="mt-2">
							<VerificationChecklist payment={payment} />
						</div>
					</section>

					{payment.invoiceId && invoice && (
						<section className="animate-rise rounded-xl border border-primary-50 p-4 sm:p-6" style={{ "--i": 4 } as React.CSSProperties}>
							<h3 className="font-semibold">Related invoice</h3>
							<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="font-medium">{invoice.invoice_number}</p>
									<p className="text-sm text-neutral-900">
										{formatAmount(invoice.total ?? 0)} USDC · {invoice.payer_name}
									</p>
								</div>
								<StatusBadge status={invoice.status || "draft"} variant="outlined" role="freelancer" />
							</div>
						</section>
					)}

					<Outcome payment={payment} />

					<div className="flex flex-col gap-3 sm:flex-row">
						{payment.invoiceId ? (
							<Button asChild className="sm:flex-1">
								<Link href={invoiceRoutes.PAYMENT_DETAILS(payment.invoiceId)}>View invoice payment</Link>
							</Button>
						) : null}
						<Button asChild variant="outline" className="sm:flex-1">
							<Link href={transactionsRoutes.PAYMENTS}>Back to payments</Link>
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

function Header({ payment }: { payment: DetectedPayment }) {
	if (payment.status === "verified" || payment.status === "detected") {
		return (
			<div className="animate-rise flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-2">
					<h2 className="h2-app">Transaction Details</h2>
					<PaymentStatusBadge verification={payment.status} />
				</div>
				<ExplorerLink hash={payment.hash} className="text-sm" />
			</div>
		);
	}

	const copy = {
		invalid: { title: "Payment could not be verified", text: "The detected transaction does not meet the invoice requirements.", Icon: ShieldAlert },
		unmatched: { title: "Unmatched transaction", text: "A transaction was detected, but no invoice match was found.", Icon: CircleAlert },
		failed: { title: "Transaction failed", text: "The transaction failed on Stellar and isn't recorded as a payment.", Icon: CircleX },
	}[payment.status];
	const warning = payment.status === "unmatched";

	return (
		<div
			className={clsx(
				"animate-rise flex items-start gap-4 rounded-xl p-4 sm:p-6",
				warning ? "bg-warning-50 text-warning-800" : "bg-error-50 text-error-500",
			)}
		>
			<span className={clsx("flex size-12 shrink-0 items-center justify-center rounded-full", warning ? "bg-warning-100" : "bg-white/70")}>
				<copy.Icon size={22} />
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-lg font-bold sm:text-xl">{copy.title}</h2>
					<PaymentStatusBadge verification={payment.status} />
				</div>
				<p className="mt-1 text-sm opacity-90">{copy.text}</p>
			</div>
		</div>
	);
}

/** States plainly what the payment did (or didn't do) to the invoice. */
function Outcome({ payment }: { payment: DetectedPayment }) {
	if (payment.status === "verified") return null;
	const text =
		payment.status === "unmatched"
			? { title: "No invoice has been marked as paid", detail: "This transaction is recorded but not linked to any invoice." }
			: { title: "Invoice remains unpaid", detail: "The invoice status has not been changed to Paid." };
	return (
		<div className="flex gap-3 rounded-lg border border-error-100 bg-error-50/60 p-4 text-sm text-error-500">
			<CircleX size={18} className="mt-0.5 shrink-0" />
			<div>
				<p className="font-medium">{text.title}</p>
				<p className="mt-0.5 opacity-80">{text.detail}</p>
			</div>
		</div>
	);
}

function Detail({ label, value, title }: { label: string; value: string; title?: string }) {
	return (
		<div className="flex flex-col justify-between gap-1 border-b border-primary-50 py-3 sm:flex-row sm:gap-5">
			<dt className="text-neutral-900">{label}</dt>
			<dd className="font-medium break-all sm:text-right" title={title}>
				{value}
			</dd>
		</div>
	);
}
