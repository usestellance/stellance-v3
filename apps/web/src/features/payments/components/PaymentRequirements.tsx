"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CopyField } from "@/features/payments/components/CopyField";
import { useMerchantWallet } from "@/features/payments/hooks";
import { USDC, shortKey } from "@/lib/stellar/config";
import { walletRoutes } from "@/lib/routes";

/**
 * On Create / Edit Invoice: what the customer will be asked to pay and how the payment is matched.
 * Recipient and asset are fixed for now (the merchant's wallet, USDC on Testnet); the reference is the
 * invoice number, assigned when the invoice is saved.
 */
export function PaymentRequirements({ total, invoiceNumber }: { total: string; invoiceNumber?: string }) {
	const wallet = useMerchantWallet();

	return (
		<section className="custom-container mt-10 lg:mt-[60px]">
			<div className="rounded-[10px] border border-primary-50 bg-primary-20 p-4 sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h3 className="text-[22px]">Payment details</h3>
					<span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-500">Stellar Testnet</span>
				</div>
				<p className="mt-1 text-sm text-neutral-900">How your customer pays this invoice, and how we match the payment to it.</p>

				<div className="mt-6 grid gap-5 md:grid-cols-2">
					<div>
						<p className="mb-2 text-sm text-neutral-900">Invoice amount</p>
						<p className="flex h-12 items-center rounded-lg bg-neutral-500 px-4 font-semibold text-primary-500">
							{total} <span className="ml-1.5 text-sm font-medium">USDC</span>
						</p>
					</div>
					<div>
						<p className="mb-2 text-sm text-neutral-900">Asset</p>
						<div className="flex h-12 items-center justify-between rounded-lg bg-neutral-500 px-4 text-sm font-medium" aria-disabled>
							{USDC.label}
							<ChevronDown size={16} className="text-neutral-800" />
						</div>
						<p className="mt-2 text-xs text-neutral-900">The only asset accepted for now.</p>
					</div>

					{wallet ? (
						<CopyField
							label="Recipient Stellar wallet"
							value={wallet}
							display={shortKey(wallet, 8, 6)}
							mono
							hint="Your Stellance wallet. Payments to any other address are never matched to this invoice."
						/>
					) : (
						<div>
							<p className="mb-2 text-sm text-neutral-900">Recipient Stellar wallet</p>
							<p className="rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-800">
								You need a wallet to get paid.{" "}
								<Link href={walletRoutes.WALLET} className="font-medium underline underline-offset-4">
									Create one
								</Link>
								.
							</p>
						</div>
					)}

					<div>
						<p className="mb-2 text-sm text-neutral-900">Payment reference / memo</p>
						<p className="flex h-12 items-center rounded-lg bg-neutral-500 px-4 font-mono text-sm text-primary-500">
							{invoiceNumber ?? "Assigned when you save (the invoice number)"}
						</p>
						<p className="mt-2 text-xs text-neutral-900">Used to match the Stellar payment to this invoice.</p>
					</div>
				</div>

				<p className="mt-5 text-xs text-neutral-900">Payments are accepted until the due date. An invoice is marked paid only after its payment is verified on Stellar.</p>
			</div>
		</section>
	);
}
