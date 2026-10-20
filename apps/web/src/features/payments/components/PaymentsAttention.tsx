"use client";

import Link from "next/link";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { useMerchantPayments } from "@/features/payments/hooks";
import { transactionsRoutes } from "@/lib/routes";

/** Overview: shown only when received payments need a look (invalid or unmatched). */
export function PaymentsAttention() {
	const { payments } = useMerchantPayments({ poll: false });
	const review = payments.filter((p) => p.status === "invalid" || p.status === "unmatched").length;
	const verified = payments.filter((p) => p.status === "verified").length;
	if (!review) return null;

	return (
		<div className="custom-container mt-5">
			<Link
				href={transactionsRoutes.PAYMENTS}
				className="animate-rise flex items-center gap-3 rounded-[10px] border border-error-100 bg-error-50/60 px-4 py-3 text-sm transition-colors hover:bg-error-50"
			>
				<ShieldAlert size={20} className="shrink-0 text-error-400" />
				<span className="min-w-0 flex-1">
					<span className="font-medium text-error-500">
						{review} payment{review === 1 ? "" : "s"} need{review === 1 ? "s" : ""} review
					</span>
					<span className="text-neutral-900"> · {verified} verified</span>
				</span>
				<ChevronRight size={16} className="shrink-0 text-error-400" />
			</Link>
		</div>
	);
}
