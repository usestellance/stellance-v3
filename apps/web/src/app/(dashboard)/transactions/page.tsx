import React from "react";
import Transactions from "@/features/transactions/components/Transactions";

export default function Page() {
	return (
		<div className="pt-5 pb-20">
			<div className="custom-container">
				<Transactions />
			</div>
		</div>
	);
}
