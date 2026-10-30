import { SERVICE_CHARGE } from "@/lib/constants";
import { formatCurrency, type InvoiceBreakdown } from "@/lib/helpers";
import { cn } from "@repo/ui/lib/utils";

/** Merchant-only: what the client pays, the Stellance fee, and what the merchant keeps. Never render it on client pages. */
export function ServiceFeeBreakdown({
	breakdown,
	canRecreate = false,
	className,
}: {
	breakdown: InvoiceBreakdown;
	/** The invoice can still be deleted and sent again (it has no payment yet). */
	canRecreate?: boolean;
	className?: string;
}) {
	// Invoices made before the fee moved to the merchant had it added to the client's total by the API.
	const legacyFee = breakdown.clientPays > breakdown.subtotal;
	// No fee to explain: the invoice total already says it all.
	if (SERVICE_CHARGE === 0 && !legacyFee) return null;

	const rows = [
		{ label: "Sub total", value: formatCurrency(breakdown.subtotal) },
		...(legacyFee
			? [{ label: "Added to the client's total", value: formatCurrency(breakdown.clientPays - breakdown.subtotal) }]
			: []),
		{ label: "Client pays", value: formatCurrency(breakdown.clientPays), strong: true },
		...(SERVICE_CHARGE > 0
			? [{ label: `Service fee (${SERVICE_CHARGE}%)`, value: `− ${formatCurrency(breakdown.serviceFee)}`, muted: true }]
			: []),
	];

	return (
		<div className={cn("w-full rounded-[10px] border border-primary-50 bg-primary-20 p-4 sm:p-5", className)}>
			<dl className="space-y-3 text-sm sm:text-base">
				{rows.map((row) => (
					<div key={row.label} className="flex items-center justify-between gap-4">
						<dt className={cn(row.muted && "text-neutral-900")}>{row.label}</dt>
						<dd className={cn("tabular-nums", row.strong && "font-bold", row.muted && "text-neutral-900")}>{row.value}</dd>
					</div>
				))}
			</dl>
			<div className="mt-4 flex items-center justify-between gap-4 border-t border-primary-50 pt-4 text-base font-bold text-primary-500 sm:text-lg">
				<span>You receive</span>
				<span className="tabular-nums">{formatCurrency(breakdown.merchantReceives)}</span>
			</div>
			{legacyFee ? (
				<p className="mt-2 text-xs text-warning-700 sm:text-sm">
					This invoice was created under the old fee, so your client is asked for{" "}
					{formatCurrency(breakdown.clientPays - breakdown.subtotal)} more and sees it as a service fee.
					{canRecreate && " To remove it, delete this invoice and send a new one."}
				</p>
			) : (
				<p className="mt-2 text-xs text-neutral-900 sm:text-sm">
					Your client only sees the total. The service fee comes out of what you receive.
				</p>
			)}
		</div>
	);
}
