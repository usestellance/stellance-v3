import { create } from "zustand";

interface TransactionFilterState {
	page: number;
	size: number;
	search: string;
	order_by: "asc" | "desc";
	status: "all" | "confirmed" | "pending" | "failed";
	transaction_type: "all" | "funding" | "withdrawal" | "transfer";

	setSearchTerm: (value: string) => void;
	setStatus: (value: "all" | "confirmed" | "pending" | "failed") => void;
	setTransactionType: (
		value: "all" | "funding" | "withdrawal" | "transfer",
	) => void;
	setPage: (page: number) => void;
	resetFilters: () => void;
}

export const useTransactionFilter = create<TransactionFilterState>((set) => ({
	page: 1,
	size: 10,
	search: "",
	order_by: "desc",
	status: "all",
	transaction_type: "all",

	setSearchTerm: (search) =>
		set({
			search,
			page: 1,
		}),

	setStatus: (status) =>
		set({
			status,
			page: 1,
		}),

	setTransactionType: (transaction_type) =>
		set({
			transaction_type,
			page: 1,
		}),

	setPage: (page) => set({ page }),

	resetFilters: () =>
		set({
			page: 1,
			search: "",
			status: "all",
			transaction_type: "all",
		}),
}));
