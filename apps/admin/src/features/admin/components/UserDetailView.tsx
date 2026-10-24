"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, KeyRound, Trash2, UserCheck, UserX } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/sonner";
import { ConfirmDialog, DataTable, ErrorNote, FilterChips, INVOICE_TONE, KeyValue, PageHeader, Pagination, Panel, Pill, TX_TONE } from "@/components/Console";
import { useDeleteUser, useResetUserPassword, useSetUserActive, useUser, useUserActivity, useUserInvoices, useUserTransactions } from "@/features/admin/hooks";
import { useAdminSession } from "@/features/auth/session";
import { errorMessage } from "@/lib/api/client";
import { formatDate, formatUsdc, shortKey, titleCase } from "@/lib/format";

type Tab = "invoices" | "transactions" | "activity";
type Action = "suspend" | "activate" | "reset" | "delete" | null;

export function UserDetailView({ id }: { id: string }) {
	const router = useRouter();
	const me = useAdminSession((s) => s.email);
	const { data, isLoading, error } = useUser(id);
	const [tab, setTab] = useState<Tab>("invoices");
	const [page, setPage] = useState(1);
	const [action, setAction] = useState<Action>(null);
	const setActive = useSetUserActive(id);
	const reset = useResetUserPassword(id);
	const remove = useDeleteUser(id);

	const user = data?.user;
	const name = user ? `${user.first_name} ${user.last_name}`.trim() || user.email : "";
	const self = !!user && user.email === me;
	const running = action === "delete" ? remove : action === "reset" ? reset : setActive;

	const confirm = async () => {
		try {
			if (action === "suspend" || action === "activate") {
				await setActive.mutateAsync(action === "activate");
				toast.success(action === "activate" ? "Account activated" : "Account suspended");
			} else if (action === "reset") {
				await reset.mutateAsync(undefined);
				toast.success(`Password reset email sent to ${user?.email}`);
			} else if (action === "delete") {
				await remove.mutateAsync(undefined);
				toast.success("Account deleted");
				router.replace("/users");
			}
			setAction(null);
		} catch {
			// Shown in the dialog.
		}
	};

	return (
		<div className="space-y-6">
			<Link href="/users" className="inline-flex items-center gap-2 text-sm font-medium text-primary-500">
				<ArrowLeft size={16} /> Users
			</Link>
			{isLoading && <p className="animate-pulse text-neutral-900">Loading user…</p>}
			{error && <ErrorNote>{errorMessage(error, "Couldn't load this user.")}</ErrorNote>}

			{user && (
				<>
					<PageHeader
						title={name}
						description={user.email}
						actions={
							<div className="flex flex-wrap gap-2">
								<Button variant="outline" size="sm" className="px-4" onClick={() => setAction("reset")}>
									<KeyRound /> Reset password
								</Button>
								{user.is_active ? (
									<Button variant="outline" size="sm" className="px-4" disabled={self} onClick={() => setAction("suspend")}>
										<UserX /> Suspend
									</Button>
								) : (
									<Button size="sm" className="px-4" onClick={() => setAction("activate")}>
										<UserCheck /> Activate
									</Button>
								)}
								<Button variant="destructive" size="sm" className="px-4" disabled={self} onClick={() => setAction("delete")}>
									<Trash2 /> Delete
								</Button>
							</div>
						}
					/>

					<div className="grid gap-6 lg:grid-cols-2">
						<Panel title="Account" index={1}>
							<dl>
								<KeyValue label="Role">
									<Pill tone={user.role === "admin" ? "info" : "neutral"}>{user.role}</Pill>
								</KeyValue>
								<KeyValue label="Status">
									<Pill tone={user.is_active ? "success" : "danger"}>{user.is_active ? "Active" : "Suspended"}</Pill>
								</KeyValue>
								<KeyValue label="Email">
									<Pill tone={user.email_verified ? "success" : "warning"}>{user.email_verified ? "Verified" : "Unverified"}</Pill>
								</KeyValue>
								<KeyValue label="Joined">{formatDate(user.created_at, true)}</KeyValue>
								<KeyValue label="User ID">
									<span className="font-mono text-xs">{user.id}</span>
								</KeyValue>
							</dl>
						</Panel>
						<Panel title="Wallets" index={2}>
							{!data.wallets?.length ? (
								<p className="text-sm text-neutral-900">No wallet yet.</p>
							) : (
								<ul className="space-y-3">
									{data.wallets.map((w) => (
										<li key={w.id} className="rounded-lg bg-primary-20 p-4 text-sm">
											<div className="flex items-center justify-between gap-2">
												<span className="font-mono" title={w.address}>
													{shortKey(w.address, 8, 6)}
												</span>
												{w.is_primary && <Pill tone="info">Primary</Pill>}
											</div>
											<p className="mt-2 text-neutral-900">
												{formatUsdc(w.usdc_balance)} · {new Intl.NumberFormat("en-US").format(w.xlm_balance)} XLM
											</p>
										</li>
									))}
								</ul>
							)}
						</Panel>
					</div>

					<Panel index={3}>
						<div className="mb-5">
							<FilterChips<Tab>
								label="Show"
								value={tab}
								onChange={(t) => {
									setTab(t);
									setPage(1);
								}}
								options={[
									{ value: "invoices", label: "Invoices" },
									{ value: "transactions", label: "Transactions" },
									{ value: "activity", label: "Activity" },
								]}
							/>
						</div>
						{tab === "invoices" && <UserInvoices id={id} page={page} onPage={setPage} />}
						{tab === "transactions" && <UserTransactions id={id} page={page} onPage={setPage} />}
						{tab === "activity" && <UserActivity id={id} page={page} onPage={setPage} />}
					</Panel>

					<ConfirmDialog
						open={action !== null}
						onOpenChange={(open) => !open && setAction(null)}
						title={
							action === "delete" ? "Delete this account?" : action === "reset" ? "Send a password reset?" : action === "suspend" ? "Suspend this account?" : "Activate this account?"
						}
						description={
							action === "delete"
								? "The account, its wallet record, invoices and history are removed for good. This can't be undone."
								: action === "reset"
									? `${user.email} gets an email with a code to choose a new password.`
									: action === "suspend"
										? "They can't sign in until the account is activated again. Their invoices stay as they are."
										: "They can sign in again."
						}
						confirmLabel={action === "delete" ? "Delete account" : action === "reset" ? "Send email" : action === "suspend" ? "Suspend" : "Activate"}
						confirmText={action === "delete" ? user.email : undefined}
						danger={action === "delete" || action === "suspend"}
						pending={running.isPending}
						error={running.error ? errorMessage(running.error) : null}
						onConfirm={confirm}
					/>
				</>
			)}
		</div>
	);
}

function UserInvoices({ id, page, onPage }: { id: string; page: number; onPage: (p: number) => void }) {
	const router = useRouter();
	const { data, isLoading } = useUserInvoices(id, page);
	return (
		<>
			<DataTable
				rows={data?.invoices}
				loading={isLoading}
				rowKey={(r) => r.id}
				onRowClick={(r) => router.push(`/invoices/${r.id}`)}
				empty="No invoices."
				columns={[
					{ key: "n", header: "Invoice", cell: (r) => <span className="font-medium">{r.invoice_number}</span> },
					{ key: "p", header: "Payer", cell: (r) => <span className="text-neutral-900">{r.payer_email}</span> },
					{ key: "t", header: "Amount", cell: (r) => formatUsdc(r.total) },
					{ key: "s", header: "Status", cell: (r) => <Pill tone={INVOICE_TONE[r.status]}>{r.status}</Pill> },
					{ key: "d", header: "Created", cell: (r) => formatDate(r.created_at) },
				]}
			/>
			<Pagination meta={data?.meta} onPage={onPage} />
		</>
	);
}

function UserTransactions({ id, page, onPage }: { id: string; page: number; onPage: (p: number) => void }) {
	const { data, isLoading } = useUserTransactions(id, page);
	return (
		<>
			<DataTable
				rows={data?.transactions}
				loading={isLoading}
				rowKey={(r) => r.id}
				empty="No transactions."
				columns={[
					{ key: "type", header: "Type", cell: (r) => <span className="capitalize">{r.type.replace(/_/g, " ")}</span> },
					{ key: "a", header: "Amount", cell: (r) => new Intl.NumberFormat("en-US").format(r.amount) },
					{ key: "i", header: "Invoice", cell: (r) => r.invoice_number || "—" },
					{ key: "s", header: "Status", cell: (r) => <Pill tone={TX_TONE[r.status]}>{r.status}</Pill> },
					{ key: "d", header: "Date", cell: (r) => formatDate(r.created_at, true) },
				]}
			/>
			<Pagination meta={data?.meta} onPage={onPage} />
		</>
	);
}

function UserActivity({ id, page, onPage }: { id: string; page: number; onPage: (p: number) => void }) {
	const { data, isLoading } = useUserActivity(id, page);
	return (
		<>
			<DataTable
				rows={data?.logs}
				loading={isLoading}
				rowKey={(r) => r.id}
				empty="No activity recorded."
				columns={[
					{ key: "a", header: "Action", cell: (r) => titleCase(r.action) },
					{ key: "d", header: "When", cell: (r) => formatDate(r.created_at, true) },
				]}
			/>
			<Pagination meta={data?.meta} onPage={onPage} />
		</>
	);
}
