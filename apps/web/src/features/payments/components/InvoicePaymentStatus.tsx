"use client";

import type { InvoiceType } from "@/features/invoice/types";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { useInvoicePaymentStatus } from "@/features/payments/hooks";

/** The payment-status badge for an invoice row (lists, overview). */
export function InvoicePaymentStatus({ invoice, className }: { invoice: InvoiceType; className?: string }) {
	const status = useInvoicePaymentStatus(invoice);
	return status ? <PaymentStatusBadge status={status} className={className} /> : <span className="text-neutral-900">—</span>;
}
