"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DataTable, INVOICE_TONE, PAYMENT_TONE, PageHeader, Panel, Pill, StatCard } from "@/components/Console";
import { useInvoices, usePayments, useStats, useUsers } from "@/features/admin/hooks";
import { assetCode, formatAmount, formatDate, formatNumber, formatUsdc, shortKey } from "@/lib/format";

/** Platform health at a glance: totals, what needs review, and the newest users and invoices. */
export function OverviewView() {
	const router = useRouter();
	const stats = useStats();
	const users = useUsers(1, "", 5);
	const invoices = useInvoices(1, "all", "", 6);
	const review = usePayments(1, "all", 100);
	const s = stats.data;
	const needsReview = review.data?.payments.filter((p) => p.verification_status === "invalid" || p.verification_status === "unmatched");
	const paidRate = s && s.total_invoices ? Math.round((s.paid_invoices / s.total_invoices) * 100) : undefined;

	return (
		<div className="space-y-6 lg:space-y-8">
			<PageHeader title="Overview" description="Stellance on Stellar Testnet: users, invoices and payment verification." />

			<div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
				<StatCard index={0} label="Users" value={s?.total_users} format={formatNumber} />
				<StatCard index={1} label="Active users" value={s?.active_users} format={formatNumber} />
				<StatCard index={2} label="Invoices" value={s?.total_invoices} format={formatNumber} />
				<StatCard index={3} label="Paid invoices" value={s?.paid_invoices} format={formatNumber} hint={paidRate !== undefined ? `${paidRate}% of all invoices` : undefined} tone="success" />
				<StatCard index={4} label="Overdue" value={s?.overdue_count} format={formatNumber} tone="danger" />
				<StatCard index={5} label="Paid volume" value={s?.total_revenue} format={(n) => formatUsdc(n)} hint="Testnet USDC" />
			</div>

			{needsReview && needsReview.length > 0 && (
				<Link
					href="/payments?status=invalid"
					className="animate-rise flex items-center justify-between gap-3 rounded-[10px] border border-error-100 bg-error-50/60 px-4 py-3 text-sm transition-colors hover:bg-error-50"
				>
					<span>
						<strong className="text-error-500">{needsReview.length} payments need review</strong>
						<span className="text-neutral-900"> · invalid or unmatched, none of them marked an invoice paid</span>
					</span>
					<ChevronRight size={16} className="shrink-0 text-error-400" />
				</Link>
			)}

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
				<Panel title="Latest invoices" index={1} action={<Link href="/invoices" className="text-sm font-medium text-primary-500 underline-offset-4 hover:underline">View all</Link>}>
					<DataTable
						rows={invoices.data?.invoices}
						loading={invoices.isLoading}
						rowKey={(r) => r.id}
						onRowClick={(r) => router.push(`/invoices/${r.id}`)}
						columns={[
							{ key: "n", header: "Invoice", cell: (r) => <span className="font-medium">{r.invoice_number}</span> },
							{ key: "m", header: "Merchant", cell: (r) => <span className="text-neutral-900">{r.creator_email}</span> },
							{ key: "t", header: "Amount", cell: (r) => formatUsdc(r.total) },
							{ key: "s", header: "Status", cell: (r) => <Pill tone={INVOICE_TONE[r.status]}>{r.status}</Pill> },
						]}
					/>
				</Panel>

				<Panel title="Newest users" index={2} action={<Link href="/users" className="text-sm font-medium text-primary-500 underline-offset-4 hover:underline">View all</Link>}>
					<ul className="divide-y divide-primary-50">
						{users.data?.users.map((u) => (
							<li key={u.id}>
								<Link href={`/users/${u.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-primary-500">
									<span className="min-w-0">
										<span className="block truncate font-medium">{`${u.first_name} ${u.last_name}`.trim() || u.email}</span>
										<span className="block truncate text-xs text-neutral-900">{u.email}</span>
									</span>
									<span className="shrink-0 text-xs text-neutral-900">{formatDate(u.created_at)}</span>
								</Link>
							</li>
						))}
					</ul>
				</Panel>
			</div>

			{review.data && (
				<Panel title="Recent payment verifications" index={3} action={<Link href="/payments" className="text-sm font-medium text-primary-500 underline-offset-4 hover:underline">Review</Link>}>
					<DataTable
						rows={review.data.payments.slice(0, 6)}
						rowKey={(r) => r.id}
						onRowClick={() => router.push("/payments")}
						columns={[
							{ key: "memo", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.payment_reference ?? "none"}</span> },
							{ key: "m", header: "Merchant wallet", cell: (r) => <span className="font-mono text-xs text-neutral-900">{shortKey(r.recipient)}</span> },
							{ key: "a", header: "Received", cell: (r) => `${formatAmount(r.amount)} ${assetCode(r)}` },
							{ key: "s", header: "Result", cell: (r) => <Pill tone={PAYMENT_TONE[r.verification_status] ?? "info"}>{r.verification_status}</Pill> },
							{ key: "r", header: "Reason", cell: (r) => <span className="whitespace-normal text-neutral-900">{r.failure_reason || "—"}</span>, className: "min-w-[220px]" },
						]}
					/>
				</Panel>
			)}
		</div>
	);
}
