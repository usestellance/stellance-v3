import type { Metadata } from "next";
import { IncomingPayments } from "@/features/payments/components/IncomingPayments";

export const metadata: Metadata = { title: "Invoice payments" };

export default function Page() {
	return (
		<div className="pt-5 pb-20">
			<div className="custom-container">
				<IncomingPayments />
			</div>
		</div>
	);
}
