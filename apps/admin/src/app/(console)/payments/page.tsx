import type { Metadata } from "next";
import { PaymentsView } from "@/features/admin/components/RecordsViews";

export const metadata: Metadata = { title: "Payment review" };

export default async function Page({ searchParams }: PageProps<"/payments">) {
	const { status } = await searchParams;
	return <PaymentsView initialStatus={typeof status === "string" ? status : "all"} />;
}
