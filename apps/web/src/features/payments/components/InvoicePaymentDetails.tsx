"use client";

import Link from "next/link";
import { ExternalLink, Link2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import GoBack from "@/components/GoBack";
import { StatusBadge } from "@/components/InvoiceStatusBadge";
import InvoiceSkeletonLoader from "@/components/InvoiceSkeletonLoader";
import { useGetInvoice } from "@/features/invoice/hooks";
import type { InvoiceType } from "@/features/invoice/types";
import { CopyField } from "@/features/payments/components/CopyField";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { PaymentSimulator } from "@/features/payments/components/PaymentSimulator";
import { PaymentStatusPanel } from "@/features/payments/components/PaymentStatusPanel";
import { useInvoicePayment, useMerchantWallet } from "@/features/payments/hooks";
import { VERIFICATION_STATUS, formatAmount, formatDateTime } from "@/features/payments/status";
import { clientRoutes, invoiceRoutes, transactionsRoutes } from "@/lib/routes";
import { withBasePath } from "@/lib/site";
import { USDC, shortKey } from "@/lib/stellar/config";
import { useToast } from "@/lib/use-toast";

/** Merchant view: what the invoice expects, the reference to share, and live payment status. */
export function InvoicePaymentDetails({ invoiceId }: { invoiceId: string }) {
	const toast = useToast();
	const wallet = useMerchantWallet();
	const { data, isLoading, isError } = useGetInvoice({ invoice_id: invoiceId });
	const invoice = data as InvoiceType | undefined;
	const { state, updatedAt, isError: networkError } = useInvoicePayment(invoice, { recipient: wallet });

	const requestPath = invoice?.invoice_url ? clientRoutes.MAKE_PAYMENT(invoice.invoice_url) : null;

	const copyRequestLink = async () => {
		if (!requestPath) return;
		try {
			await navigator.clipboard.writeText(`${window.location.origin}${withBasePath(requestPath)}`);
			toast.success("Payment link copied");
		} catch {
			toast.error("Couldn't copy the payment link");
		}
	};

	return (
		<div className="custom-container mx-auto max-w-4xl pt-5 pb-20 md:pt-10">
			<GoBack />

			<header className="animate-rise mt-6 md:mt-10">
				<h2 className="h2-app">Invoice Payment Details</h2>
				<p className="mt-2 text-sm text-neutral-900 md:text-base">
					What your customer needs to pay, and whether it has arrived and been verified on Stellar.
				</p>
			</header>

			{isLoading && (
				<div className="mt-10">
					<InvoiceSkeletonLoader />
				</div>
			)}
			{isError && <p className="mt-16 text-center sm:text-lg">Unable to load this invoice.</p>}
			{!isLoading && !isError && invoice && !state && (
				<p className="mt-16 rounded-xl bg-warning-50 p-5 text-center text-sm text-warning-800">
					Create a wallet first: payments go to your Stellance wallet, so the invoice has no recipient yet.
				</p>
			)}

			{invoice && state && (
				<div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-6">
					<section
						className="animate-rise space-y-5 rounded-xl border border-primary-50 bg-primary-20 p-4 sm:p-6"
						style={{ "--i": 1 } as React.CSSProperties}
					>
						<div className="flex flex-wrap items-center justify-between gap-3">
							<p className="text-lg font-semibold">{invoice.invoice_number}</p>
							<PaymentStatusBadge status={state.status} />
						</div>

						<div className="rounded-lg bg-neutral-500 p-4">
							<p className="text-sm text-neutral-900">Expected payment</p>
							<p className="mt-1 text-2xl font-bold tracking-tight text-primary-500 sm:text-[32px]">
								{formatAmount(state.expectation.amount)} {state.expectation.asset.code}
							</p>
							<p className="mt-1 text-xs text-neutral-900">{USDC.label} · issuer {shortKey(USDC.issuer)}</p>
						</div>

						<CopyField label="Recipient wallet" value={state.expectation.recipient} display={shortKey(state.expectation.recipient, 8, 6)} mono />
						<CopyField
							label="Payment reference / memo"
							value={state.expectation.reference}
							mono
							hint="Your customer must add this memo so the payment can be matched to this invoice."
						/>

						<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
							<span className="text-neutral-900">Invoice status</span>
							<StatusBadge status={invoice.status || "draft"} variant="outlined" role="freelancer" />
						</div>
						<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
							<span className="text-neutral-900">Payment window</span>
							<span className="font-medium">until {formatDateTime(state.expectation.dueDate)}</span>
						</div>
					</section>

					<section className="animate-rise space-y-5" style={{ "--i": 2 } as React.CSSProperties}>
						<h3 className="text-lg font-semibold">Payment status</h3>
						<PaymentStatusPanel state={state} updatedAt={updatedAt} paymentHref={transactionsRoutes.PAYMENT} />
						{state.status !== "not_started" && state.status !== "cancelled" && <PaymentSimulator invoiceId={invoiceId} />}
						{networkError && (
							<p className="rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-800">
								Can&apos;t reach Stellar Testnet right now. The status will update when it&apos;s back.
							</p>
						)}

						<div className="flex flex-col gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
							{requestPath && (
								<Button asChild className="sm:flex-1">
									<a href={withBasePath(requestPath)} target="_blank" rel="noreferrer">
										View payment request <ExternalLink />
									</a>
								</Button>
							)}
							<Button variant="outline" onClick={copyRequestLink} className="sm:flex-1" disabled={!requestPath}>
								<Link2 /> Copy payment link
							</Button>
						</div>
						<Link
							href={invoiceRoutes.PREVIEW_INVOICE({ invoice_id: invoiceId })}
							className="block text-center text-sm font-medium text-primary-500 underline-offset-4 hover:underline"
						>
							Back to invoice
						</Link>

						{state.attempts.length > 1 && (
							<div>
								<h4 className="mt-4 font-semibold">Payment history</h4>
								<ul className="mt-3 divide-y divide-primary-50 rounded-xl border border-primary-50">
									{state.attempts.map((attempt) => (
										<li key={attempt.id}>
											<Link
												href={transactionsRoutes.PAYMENT(attempt.id)}
												className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-primary-20"
											>
												<span className="min-w-0">
													<span className="block font-medium">
														{formatAmount(attempt.amount)} {attempt.asset.code}
													</span>
													<span className="block text-xs text-neutral-900">{formatDateTime(attempt.detectedAt)}</span>
												</span>
												<span className="shrink-0 text-xs font-medium">{VERIFICATION_STATUS[attempt.status].label}</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
						)}
					</section>
				</div>
			)}

		</div>
	);
}
