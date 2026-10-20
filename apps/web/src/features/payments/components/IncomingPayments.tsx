"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowDownToLine } from "lucide-react";
import { useState } from "react";
import { TransactionsTabs } from "@/features/transactions/components/TransactionsTabs";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { useMerchantPayments } from "@/features/payments/hooks";
import { formatAmount, formatDateTime } from "@/features/payments/status";
import type { VerificationStatus } from "@/features/payments/types";
import { shortKey } from "@/lib/stellar/config";
import { transactionsRoutes, walletRoutes } from "@/lib/routes";

const FILTERS: { value: VerificationStatus | "all"; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "verified", label: "Verified" },
	{ value: "invalid", label: "Invalid" },
	{ value: "unmatched", label: "Unmatched" },
	{ value: "failed", label: "Failed" },
];

/** Every payment received to the merchant's wallet, with its verification result. */
export function IncomingPayments() {
	const { payments, isLoading, isError, wallet } = useMerchantPayments({ poll: true });
	const [filter, setFilter] = useState<VerificationStatus | "all">("all");
	const shown = filter === "all" ? payments : payments.filter((p) => p.status === filter);
	const needsReview = payments.filter((p) => p.status === "invalid" || p.status === "unmatched").length;

	return (
		<div className="mx-auto">
			<h2 className="h2-app">Transactions</h2>
			<TransactionsTabs />

			<p className="mt-6 max-w-2xl text-sm text-neutral-900 lg:text-base">
				Payments received to your wallet, checked against your invoices for recipient, asset, amount and reference. Only verified
				payments can settle an invoice.
				{needsReview > 0 && (
					<span className="mt-2 block font-medium text-error-500">
						{needsReview} payment{needsReview > 1 ? "s" : ""} need{needsReview > 1 ? "" : "s"} review.
					</span>
				)}
			</p>

			<div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter payments">
				{FILTERS.map((f) => (
					<button
						key={f.value}
						type="button"
						role="tab"
						aria-selected={filter === f.value}
						onClick={() => setFilter(f.value)}
						className={clsx(
							"h-9 cursor-pointer rounded-full px-4 text-sm font-medium transition-colors",
							filter === f.value ? "bg-primary-500 text-white" : "bg-primary-50 text-primary-500 hover:bg-primary-100",
						)}
					>
						{f.label}
					</button>
				))}
			</div>

			<section className="mt-6 space-y-[15px]">
				{!wallet && (
					<p className="mt-16 text-center lg:text-xl">
						Create a <Link href={walletRoutes.WALLET} className="underline underline-offset-4">wallet</Link> to receive invoice payments.
					</p>
				)}
				{wallet && isLoading && <p className="mt-16 animate-pulse text-center text-neutral-900">Checking Stellar Testnet…</p>}
				{wallet && isError && (
					<p className="mt-10 rounded-lg bg-warning-50 p-4 text-center text-sm text-warning-800">
						Can&apos;t reach Stellar Testnet right now. Retrying automatically.
					</p>
				)}
				{wallet && !isLoading && shown.length === 0 && (
					<p className="mt-16 text-center lg:text-xl">{filter === "all" ? "No payments received yet" : "Nothing here"}</p>
				)}

				{shown.map((payment, i) => (
					<Link
						key={payment.id}
						href={transactionsRoutes.PAYMENT(payment.id)}
						className="animate-rise block rounded-xl border border-primary-50/60 bg-primary-20 p-4 transition-colors duration-150 hover:border-primary-300 sm:p-5 lg:p-6"
						style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
					>
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div className="flex min-w-0 gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-neutral-500 sm:size-12">
									<ArrowDownToLine size={20} />
								</div>
								<div className="min-w-0">
									<h4 className="text-base leading-tight font-semibold text-primary-600 lg:text-lg">
										{payment.invoiceNumber ?? "No matching invoice"}
									</h4>
									<p className="mt-1 text-sm text-neutral-900">{formatDateTime(payment.detectedAt)}</p>
									<p className="mt-2 truncate font-mono text-xs text-neutral-900">
										{shortKey(payment.hash, 8, 8)} · memo {payment.memo ?? "none"}
									</p>
								</div>
							</div>
							<div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
								<p className="text-lg font-bold whitespace-nowrap sm:text-xl lg:text-2xl">
									+{formatAmount(payment.amount)} {payment.asset.code}
								</p>
								<PaymentStatusBadge verification={payment.status} />
							</div>
						</div>
					</Link>
				))}
			</section>
		</div>
	);
}
