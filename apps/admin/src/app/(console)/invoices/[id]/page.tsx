import type { Metadata } from "next";
import { InvoiceDetailView } from "@/features/admin/components/RecordsViews";

export const metadata: Metadata = { title: "Invoice" };

export default async function Page({ params }: PageProps<"/invoices/[id]">) {
	const { id } = await params;
	return <InvoiceDetailView id={id} />;
}
