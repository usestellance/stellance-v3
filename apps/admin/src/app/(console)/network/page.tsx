import type { Metadata } from "next";
import { NetworkView } from "@/features/admin/components/RecordsViews";

export const metadata: Metadata = { title: "Network" };

export default function Page() {
	return <NetworkView />;
}
