"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import axios from "axios";
import { DataTable, ErrorNote, FilterChips, INVOICE_TONE, KeyValue, PAYMENT_TONE, PageHeader, Pagination, Panel, Pill, SearchField, TX_TONE } from "@/components/Console";
import { useInvoice, useInvoices, useNetwork, usePayments, useTransactions } from "@/features/admin/hooks";
import { errorMessage } from "@/lib/api/client";
import { assetCode, explorerTx, formatAmount, formatDate, formatUsdc, shortKey } from "@/lib/format";

const INVOICE_FILTERS = [
	{ value: "all", label: "All" },
	{ value: "draft", label: "Draft" },
	{ value: "sent", label: "Sent" },
	{ value: "viewed", label: "Viewed" },
	{ value: "paid", label: "Paid" },
	{ value: "invalid_payment", label: "Invalid payment" },
	{ value: "expired", label: "Expired" },
	{ value: "cancelled", label: "Cancelled" },
];

export function InvoicesView() {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState("all");
	const [search, setSearch] = useState("");
	const query = useDeferredValue(search.trim());
	const { data, isLoading, error } = useInvoices(page, status, query);

	return (
		<div className="space-y-6">
			<PageHeader title="Invoices" description="Every invoice on the platform, across all merchants." />
			<Panel>
				<div className="mb-5 space-y-4">
					<SearchField
						value={search}
						onChange={(v) => {
							setSearch(v);
							setPage(1);
						}}
						placeholder="Search invoice number or email"
					/>
					<FilterChips
						label="Status"
						value={status}
						options={INVOICE_FILTERS}
						onChange={(v) => {
							setStatus(v);
							setPage(1);
						}}
					/>
				</div>
				{error && <ErrorNote>{errorMessage(error, "Couldn't load invoices.")}</ErrorNote>}
				<DataTable
					rows={data?.invoices}
					loading={isLoading}
					rowKey={(r) => r.id}
					onRowClick={(r) => router.push(`/invoices/${r.id}`)}
					empty="No invoices match."
					columns={[
						{ key: "n", header: "Invoice", cell: (r) => <span className="font-medium">{r.invoice_number}</span> },
						{ key: "m", header: "Merchant", cell: (r) => <span className="text-neutral-900">{r.creator_email}</span> },
						{ key: "p", header: "Payer", cell: (r) => <span className="text-neutral-900">{r.payer_email}</span> },
						{ key: "t", header: "Amount", cell: (r) => formatUsdc(r.total) },
						{ key: "s", header: "Status", cell: (r) => <Pill tone={INVOICE_TONE[r.status]}>{r.status}</Pill> },
						{ key: "d", header: "Created", cell: (r) => formatDate(r.created_at) },
					]}
				/>
				<Pagination meta={data?.meta} onPage={setPage} />
			</Panel>
		</div>
	);
}

export function InvoiceDetailView({ id }: { id: string }) {
	const { data, isLoading, error } = useInvoice(id);
	return (
		<div className="space-y-6">
			<Link href="/invoices" className="inline-flex items-center gap-2 text-sm font-medium text-primary-500">
				<ArrowLeft size={16} /> Invoices
			</Link>
			{isLoading && <p className="animate-pulse text-neutral-900">Loading invoice…</p>}
			{error && <ErrorNote>{errorMessage(error, "Couldn't load this invoice.")}</ErrorNote>}
			{data && (
				<>
					<PageHeader title={data.invoice_number} description={`Issued by ${data.creator_email}`} actions={<Pill tone={INVOICE_TONE[data.status]}>{data.status}</Pill>} />
					<Panel title="Invoice" index={1} className="max-w-2xl">
						<dl>
							<KeyValue label="Amount">{formatUsdc(data.total)}</KeyValue>
							<KeyValue label="Merchant">{data.creator_email}</KeyValue>
							<KeyValue label="Payer">{data.payer_email}</KeyValue>
							<KeyValue label="Status">
								<Pill tone={INVOICE_TONE[data.status]}>{data.status}</Pill>
							</KeyValue>
							<KeyValue label="Created">{formatDate(data.created_at, true)}</KeyValue>
							<KeyValue label="Invoice ID">
								<span className="font-mono text-xs">{data.id}</span>
							</KeyValue>
						</dl>
					</Panel>
				</>
			)}
		</div>
	);
}

export function TransactionsView() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const query = useDeferredValue(search.trim());
	const { data, isLoading, error } = useTransactions(page, query);

	return (
		<div className="space-y-6">
			<PageHeader title="Transactions" description="Wallet activity across the platform: funding, transfers and withdrawals." />
			<Panel>
				<div className="mb-5">
					<SearchField
						value={search}
						onChange={(v) => {
							setSearch(v);
							setPage(1);
						}}
						placeholder="Search email, invoice or type"
					/>
				</div>
				{error && <ErrorNote>{errorMessage(error, "Couldn't load transactions.")}</ErrorNote>}
				<DataTable
					rows={data?.transactions}
					loading={isLoading}
					rowKey={(r) => r.id}
					empty="No transactions match."
					columns={[
						{ key: "u", header: "User", cell: (r) => <span className="text-neutral-900">{r.user_email}</span> },
						{ key: "type", header: "Type", cell: (r) => <span className="capitalize">{r.type}</span> },
						{ key: "a", header: "Amount", cell: (r) => new Intl.NumberFormat("en-US").format(r.amount) },
						{ key: "i", header: "Invoice", cell: (r) => r.invoice_number || "—" },
						{ key: "s", header: "Status", cell: (r) => <Pill tone={TX_TONE[r.status]}>{r.status}</Pill> },
						{ key: "d", header: "Date", cell: (r) => formatDate(r.created_at, true) },
					]}
				/>
				<Pagination meta={data?.meta} onPage={setPage} />
			</Panel>
		</div>
	);
}

const PAYMENT_FILTERS = [
	{ value: "all", label: "All" },
	{ value: "invalid", label: "Invalid" },
	{ value: "unmatched", label: "Unmatched" },
	{ value: "failed", label: "Failed" },
	{ value: "verified", label: "Verified" },
];

/** Detected payments and their verdicts across the platform, for review (GET /admin/payments). */
export function PaymentsView({ initialStatus = "all" }: { initialStatus?: string }) {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState(initialStatus);
	const [search, setSearch] = useState("");
	const query = useDeferredValue(search.trim());
	const { data, isLoading, error } = usePayments(page, status, 20, query);
	const notBuilt = axios.isAxiosError(error) && error.response?.status === 404;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Payment review"
				description="Every Stellar payment the platform detected, and whether it passed verification. Invalid and unmatched payments never mark an invoice paid."
			/>
			<Panel>
				<div className="mb-5 space-y-4">
					<SearchField
						value={search}
						onChange={(v) => {
							setSearch(v);
							setPage(1);
						}}
						placeholder="Search hash, reference, address or invoice"
					/>
					<FilterChips
						label="Result"
						value={status}
						options={PAYMENT_FILTERS}
						onChange={(v) => {
							setStatus(v);
							setPage(1);
						}}
					/>
				</div>
				{notBuilt ? (
					<p className="rounded-lg bg-warning-50 p-4 text-sm text-warning-800">
						This API doesn&apos;t expose <code>/admin/payments</code>. Check that the console points at the current Stellance API.
					</p>
				) : (
					<>
						{error && <ErrorNote>{errorMessage(error, "Couldn't load payments.")}</ErrorNote>}
						<DataTable
							rows={data?.payments}
							loading={isLoading}
							rowKey={(r) => r.id}
							empty="No payments with this result."
							columns={[
								{ key: "memo", header: "Reference", cell: (r) => <span className="font-mono text-xs">{r.payment_reference ?? "none"}</span> },
								{ key: "m", header: "Merchant", cell: (r) => <span className="text-xs text-neutral-900" title={r.recipient}>{r.merchant_email ?? <span className="font-mono">{shortKey(r.recipient)}</span>}</span> },
								{ key: "a", header: "Received", cell: (r) => `${formatAmount(r.amount)} ${assetCode(r)}` },
								{ key: "s", header: "Result", cell: (r) => <Pill tone={PAYMENT_TONE[r.verification_status] ?? "info"}>{r.verification_status === "detected" || r.verification_status === "pending" ? "verifying" : r.verification_status}</Pill> },
								{ key: "r", header: "Reason", cell: (r) => <span className="whitespace-normal text-neutral-900">{r.failure_reason || (r.invoice_number ? `Paid ${r.invoice_number}` : r.invoice_id ? "Matched an invoice" : "—")}</span>, className: "min-w-[220px]" },
								{ key: "d", header: "Detected", cell: (r) => formatDate(r.detected_at, true) },
								{
									key: "tx",
									header: "Transaction",
									cell: (r) => (
										<a href={r.explorer_url || explorerTx(r.transaction_hash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-info-500 hover:underline" onClick={(e) => e.stopPropagation()}>
											{shortKey(r.transaction_hash, 6, 4)} <ExternalLink size={12} />
										</a>
									),
								},
							]}
						/>
						<Pagination meta={data?.meta} onPage={setPage} />
					</>
				)}
			</Panel>
		</div>
	);
}

/** The Stellar network the platform runs on. Read-only: this sprint is Testnet only (mainnet is out of scope). */
export function NetworkView() {
	const { data, error, isLoading } = useNetwork();
	const unset = axios.isAxiosError(error) && error.response?.status === 404;
	const network = data?.network ?? (unset ? "testnet" : undefined);

	return (
		<div className="space-y-6">
			<PageHeader title="Network" description="Which Stellar network payments are detected and verified on." />
			<Panel className="max-w-2xl">
				{isLoading && <p className="animate-pulse text-neutral-900">Checking…</p>}
				{error && !unset && <ErrorNote>{errorMessage(error, "Couldn't read the network setting.")}</ErrorNote>}
				{network && (
					<dl>
						<KeyValue label="Network">
							<Pill tone={network === "testnet" ? "info" : "danger"}>{network === "testnet" ? "Stellar Testnet" : "Mainnet"}</Pill>
						</KeyValue>
						<KeyValue label="Setting">{unset ? "Not set on the API (defaults to Testnet)" : "Configured"}</KeyValue>
						<KeyValue label="Asset">USDC · {shortKey("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5")}</KeyValue>
						<KeyValue label="Horizon">horizon-testnet.stellar.org</KeyValue>
					</dl>
				)}
				<p className="mt-5 text-sm text-neutral-900">
					Switching networks is deliberately not available here: this phase runs on Testnet only, and real-money payments are out of
					scope.
				</p>
			</Panel>
		</div>
	);
}
