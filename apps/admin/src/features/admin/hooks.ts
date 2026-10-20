"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getData } from "@/lib/api/client";
import type {
	AdminActivity,
	AdminInvoice,
	AdminPayment,
	AdminStats,
	AdminTransaction,
	AdminUser,
	AdminUserDetail,
	Paged,
} from "@/features/admin/types";

/** Every console query and action. Lists keep the previous page while the next one loads. */

const qs = (params: Record<string, string | number | undefined>) => {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "" && value !== "all") search.set(key, String(value));
	const text = search.toString();
	return text ? `?${text}` : "";
};

export const useStats = () => useQuery({ queryKey: ["admin", "stats"], queryFn: () => getData<AdminStats>("/admin/stats") });

export const useUsers = (page: number, search: string, limit = 20) =>
	useQuery({
		queryKey: ["admin", "users", page, search, limit],
		queryFn: () => getData<Paged<"users", AdminUser>>(`/admin/users${qs({ page, limit, search })}`),
		placeholderData: keepPreviousData,
	});

export const useUser = (id: string) =>
	useQuery({ queryKey: ["admin", "user", id], queryFn: () => getData<AdminUserDetail>(`/admin/users/${id}`) });

export const useUserInvoices = (id: string, page: number) =>
	useQuery({
		queryKey: ["admin", "user", id, "invoices", page],
		queryFn: () => getData<Paged<"invoices", AdminInvoice>>(`/admin/users/${id}/invoices${qs({ page, limit: 10 })}`),
		placeholderData: keepPreviousData,
	});

export const useUserTransactions = (id: string, page: number) =>
	useQuery({
		queryKey: ["admin", "user", id, "transactions", page],
		queryFn: () => getData<Paged<"transactions", AdminTransaction>>(`/admin/users/${id}/transactions${qs({ page, limit: 10 })}`),
		placeholderData: keepPreviousData,
	});

export const useUserActivity = (id: string, page: number) =>
	useQuery({
		queryKey: ["admin", "user", id, "activity", page],
		queryFn: () => getData<Paged<"logs", AdminActivity>>(`/admin/users/${id}/activity${qs({ page, limit: 10 })}`),
		placeholderData: keepPreviousData,
	});

export const useInvoices = (page: number, status: string, search: string, limit = 20) =>
	useQuery({
		queryKey: ["admin", "invoices", page, status, search, limit],
		queryFn: () => getData<Paged<"invoices", AdminInvoice>>(`/admin/invoices${qs({ page, limit, status, search })}`),
		placeholderData: keepPreviousData,
	});

export const useInvoice = (id: string) =>
	useQuery({ queryKey: ["admin", "invoice", id], queryFn: () => getData<AdminInvoice>(`/admin/invoices/${id}`) });

export const useTransactions = (page: number, search: string, limit = 20) =>
	useQuery({
		queryKey: ["admin", "transactions", page, search, limit],
		queryFn: () => getData<Paged<"transactions", AdminTransaction>>(`/admin/transactions${qs({ page, limit, search })}`),
		placeholderData: keepPreviousData,
	});

/** Planned endpoint: a 404 from the live API means "not built yet", not an error to retry. */
export const usePayments = (page: number, status: string, limit = 20) =>
	useQuery({
		queryKey: ["admin", "payments", page, status, limit],
		queryFn: () => getData<Paged<"payments", AdminPayment>>(`/admin/payments${qs({ page, limit, status })}`),
		placeholderData: keepPreviousData,
		retry: false,
	});

export const useNetwork = () =>
	useQuery({
		queryKey: ["admin", "network"],
		queryFn: () => getData<{ network: "testnet" | "mainnet" }>("/admin/config/network"),
		retry: false,
	});

function useAdminAction<V>(run: (vars: V) => Promise<unknown>, invalidate: string[][]) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: run,
		onSuccess: () => Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
	});
}

export const useSetUserActive = (id: string) =>
	useAdminAction((active: boolean) => api.patch(`/admin/users/${id}/status?active=${active}`), [["admin", "user", id], ["admin", "users"], ["admin", "stats"]]);

export const useResetUserPassword = (id: string) => useAdminAction(() => api.post(`/admin/users/${id}/reset-password`), []);

export const useDeleteUser = (id: string) => useAdminAction(() => api.delete(`/admin/users/${id}`), [["admin", "users"], ["admin", "stats"]]);
