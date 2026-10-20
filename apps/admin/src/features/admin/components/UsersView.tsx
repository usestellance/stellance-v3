"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";
import { DataTable, ErrorNote, PageHeader, Pagination, Panel, Pill, SearchField } from "@/components/Console";
import { useUsers } from "@/features/admin/hooks";
import { formatDate } from "@/lib/format";
import { errorMessage } from "@/lib/api/client";

export function UsersView() {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const query = useDeferredValue(search.trim());
	const { data, isLoading, error } = useUsers(page, query);

	return (
		<div className="space-y-6">
			<PageHeader title="Users" description="Every account, its verification and status. Open one to manage it." />
			<Panel>
				<div className="mb-5">
					<SearchField
						value={search}
						onChange={(v) => {
							setSearch(v);
							setPage(1);
						}}
						placeholder="Search by name or email"
					/>
				</div>
				{error && <ErrorNote>{errorMessage(error, "Couldn't load users.")}</ErrorNote>}
				<DataTable
					rows={data?.users}
					loading={isLoading}
					rowKey={(u) => u.id}
					onRowClick={(u) => router.push(`/users/${u.id}`)}
					empty={query ? "No users match that search." : "No users yet."}
					columns={[
						{ key: "name", header: "Name", cell: (u) => <span className="font-medium">{`${u.first_name} ${u.last_name}`.trim() || "—"}</span> },
						{ key: "email", header: "Email", cell: (u) => <span className="text-neutral-900">{u.email}</span> },
						{ key: "role", header: "Role", cell: (u) => <Pill tone={u.role === "admin" ? "info" : "neutral"}>{u.role}</Pill> },
						{ key: "verified", header: "Verified", cell: (u) => <Pill tone={u.email_verified ? "success" : "warning"}>{u.email_verified ? "Verified" : "Unverified"}</Pill> },
						{ key: "status", header: "Status", cell: (u) => <Pill tone={u.is_active ? "success" : "danger"}>{u.is_active ? "Active" : "Suspended"}</Pill> },
						{ key: "joined", header: "Joined", cell: (u) => formatDate(u.created_at) },
					]}
				/>
				<Pagination meta={data?.meta} onPage={setPage} />
			</Panel>
		</div>
	);
}
