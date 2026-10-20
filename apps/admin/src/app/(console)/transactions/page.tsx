import type { Metadata } from "next";
import { TransactionsView } from "@/features/admin/components/RecordsViews";

export const metadata: Metadata = { title: "Transactions" };

export default function Page() {
	return <TransactionsView />;
}
