import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import useAxiosAuth from "@/lib/api/use-axios-auth";
import { useToast } from "@/lib/use-toast";
import { useAuthStore, useLogout } from "@/features/auth/store";
import { authRoutes } from "@/lib/routes";

export interface TransferFundsPayload {
  amount: string;
  destination_address: string;
  source_asset: "XLM" | "USDC";
  dest_asset: "XLM" | "USDC";
  pin: string;
}

interface WalletResponseType {
	message: string;
	data: {
		id: string;
		wallet_address: string;
		balance: {
			usdc: number;
			xlm: number;
		};
	};
}

export const useGenerateWallet = () => {
	const logout = useLogout();
	const toast = useToast();
	const axiousAuth = useAxiosAuth();
	const router = useRouter();
	const queryClient = useQueryClient();

	const handleCreateWallet = async () => {
		const response = await axiousAuth.post("/wallet");
		return response.data;
	};

	const mutation = useMutation<
		WalletResponseType,
		AxiosError<WalletResponseType>
	>({
		mutationFn: handleCreateWallet,
		onSuccess: (response) => {
			toast.success(response.message);
			window.location.reload();
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: (error) => {
			const errorMessage =
				axios.isAxiosError(error) && error?.response?.data?.message
					? error?.response?.data?.message
					: "An unknown error occurred.";

			if (error.response?.status === 401) {
				toast.error("Unauthorized Access");
				router.push(authRoutes.LOGIN);
				logout();
			} else {
				toast.error(errorMessage);
			}

			console.log(error?.response);
		},
	});

	return mutation;
};

// Create Pin Hook
interface CreatePinPayload {
	pin: string;
}

export const useCreatePin = () => {
	const { post } = useAxiosAuth();
	const queryClient = useQueryClient();
	const credentials = useAuthStore((state) => state.credentials);

	console.log(credentials, "credentials");

	const walletId = useAuthStore((state) => state.credentials?.user?.wallet?.id);

	return useMutation({
		mutationFn: async (payload: CreatePinPayload) => {
			if (!walletId) {
				throw new Error("Wallet not found.");
			}

			const { data } = await post(`/wallet/${walletId}/pin`, payload);

			return data;
		},

		onSuccess: () => {
			// Refresh wallet details if needed
			queryClient.invalidateQueries({
				queryKey: ["wallet"],
			});

			// Refresh transactions if necessary
			queryClient.invalidateQueries({
				queryKey: ["transactions"],
			});
		},
	});
};

export const useExportWalletKeys = () => {
	const { get } = useAxiosAuth();

	const walletId = useAuthStore((state) => state.credentials?.user?.wallet?.id);

	return useMutation({
		mutationFn: async () => {
			const response = await get(`/wallet/export/${walletId}`, {
				responseType: "blob",
			});

			const blob = new Blob([response.data], {
				type: "application/pdf",
			});

			const url = window.URL.createObjectURL(blob);

			const link = document.createElement("a");

			link.href = url;
			link.download = "wallet-keys.pdf";

			document.body.appendChild(link);

			link.click();

			link.remove();

			window.URL.revokeObjectURL(url);
		},
	});
};


export const useTransferFunds = () => {
	const { post } = useAxiosAuth();
	const queryClient = useQueryClient();

	const walletId = useAuthStore((state) => state.credentials?.user?.wallet?.id);

	return useMutation({
		mutationFn: async (payload: TransferFundsPayload) => {
			if (!walletId) {
				throw new Error("Wallet not found.");
			}

			const { data } = await post(`/wallet/${walletId}/pay/transfer`, payload);

			return data;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["wallet"],
			});

			queryClient.invalidateQueries({
				queryKey: ["transactions"],
			});
		},
	});
};