import type { Metadata } from "next";
import { InvoicePaymentDetails } from "@/features/payments/components/InvoicePaymentDetails";

export const metadata: Metadata = { title: "Invoice payment details" };

export default async function Page({ params }: PageProps<"/invoices/[invoiceId]/payment">) {
	const { invoiceId } = await params;
	return <InvoicePaymentDetails invoiceId={invoiceId} />;
}
