import type { Metadata } from "next";
import { PaymentDetails } from "@/features/payments/components/PaymentDetails";

export const metadata: Metadata = { title: "Payment details" };

export default async function Page({ params }: PageProps<"/transactions/payments/[paymentId]">) {
	const { paymentId } = await params;
	return <PaymentDetails paymentId={paymentId} />;
}
