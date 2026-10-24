import type { InvoiceType } from "@/features/invoice/types";
import { paymentStatusOf } from "@/features/payments/api";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";

/** The payment-status badge for an invoice row (lists, overview), read from the invoice's own status. */
export function InvoicePaymentStatus({ invoice, className }: { invoice: InvoiceType; className?: string }) {
	return <PaymentStatusBadge status={paymentStatusOf(invoice)} className={className} />;
}
