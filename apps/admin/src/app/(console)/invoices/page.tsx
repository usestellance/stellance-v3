import type { Metadata } from "next";
import { InvoicesView } from "@/features/admin/components/RecordsViews";

export const metadata: Metadata = { title: "Invoices" };

export default function Page() {
	return <InvoicesView />;
}
