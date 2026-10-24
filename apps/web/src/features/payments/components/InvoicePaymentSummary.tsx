"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { InvoiceType } from "@/features/invoice/types";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { useInvoicePayment } from "@/features/payments/hooks";
import { PAYMENT_STATUS, formatAmount } from "@/features/payments/status";
import { invoiceRoutes } from "@/lib/routes";

/** On the invoice preview: how much is expected, where the payment stands, and the way into the details. */
export function InvoicePaymentSummary({ invoice }: { invoice: InvoiceType }) {
	const { data: state } = useInvoicePayment(invoice.id);
	if (!state || !invoice.id) return null;

	return (
		<Link
			href={invoiceRoutes.PAYMENT_DETAILS(invoice.id)}
			className="animate-rise mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-50 bg-primary-20 px-4 py-3 transition-colors hover:border-primary-300 sm:px-5"
		>
			<div className="min-w-0">
				<p className="text-xs text-neutral-900">Expected payment</p>
				<p className="font-semibold text-primary-500">
					{formatAmount(state.expectation.amount)} {state.expectation.asset.code}
				</p>
			</div>
			<div className="flex items-center gap-3">
				<div className="text-right">
					<PaymentStatusBadge status={state.status} />
					<p className="mt-1 hidden text-xs text-neutral-900 sm:block">{PAYMENT_STATUS[state.status].title}</p>
				</div>
				<span className="flex items-center gap-1 text-sm font-medium text-primary-500">
					Payment details <ChevronRight size={16} />
				</span>
			</div>
		</Link>
	);
}
