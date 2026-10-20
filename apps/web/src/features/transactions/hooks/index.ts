import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/lib/api/use-axios-auth";
import { useAuthStore } from "@/features/auth/store";

import { useTransactionFilter } from "@/features/transactions/store";

export const useGetTransactions = () => {
	const { page, size, search, status, transaction_type, order_by } =
		useTransactionFilter();

	const credentials = useAuthStore((state) => state.credentials);
	const { get } = useAxiosAuth();

	const handleGetTransactions = async () => {
		const params = new URLSearchParams();

		params.append("page", String(page));
		params.append("size", String(size));
		params.append("order_by", order_by);

		if (search) {
			params.append("search", search);
		}

		if (status !== "all") {
			params.append("status", status);
		}

		if (transaction_type !== "all") {
			params.append("transaction_type", transaction_type);
		}

		const { data } = await get(`/transaction?${params.toString()}`);

		return data.data;
	};

	return useQuery({
		queryKey: [
			"transactions",
			page,
			size,
			search,
			status,
			transaction_type,
			order_by,
		],
		queryFn: handleGetTransactions,
		enabled: !!credentials?.access_token,
		retry: 2,
		refetchOnWindowFocus: true,
	});
};

export const useGetTransaction = (transactionId?: string) => {
	const credentials = useAuthStore((state) => state.credentials);
	const { get } = useAxiosAuth();

	const handleGetTransaction = async () => {
		const { data } = await get(`/transaction/id/${transactionId}`);

		return data.data;
	};

	return useQuery({
		queryKey: ["transaction", transactionId],
		queryFn: handleGetTransaction,
		enabled: !!credentials?.access_token && !!transactionId,
		retry: 2,
		refetchOnWindowFocus: false,
	});
};
