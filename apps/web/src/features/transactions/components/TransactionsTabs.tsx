"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { transactionsRoutes } from "@/lib/routes";

const TABS = [
	{ href: transactionsRoutes.TRANSACTIONS, label: "Wallet activity" },
	{ href: transactionsRoutes.PAYMENTS, label: "Invoice payments" },
];

/** Wallet activity (the API's ledger) and invoice payments (detection + verification). */
export function TransactionsTabs() {
	const pathname = usePathname();
	return (
		<nav className="mt-6 flex h-10 w-full max-w-[420px] overflow-hidden rounded-[5px] bg-primary-50 text-sm font-medium lg:h-12 lg:text-base">
			{TABS.map((tab) => {
				const active = pathname === tab.href;
				return (
					<Link
						key={tab.href}
						href={tab.href}
						aria-current={active ? "page" : undefined}
						className={clsx("flex flex-1 items-center justify-center transition-colors duration-150", active && "bg-primary-500 text-white")}
					>
						{tab.label}
					</Link>
				);
			})}
		</nav>
	);
}
