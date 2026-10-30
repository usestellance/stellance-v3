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
		// Testnet funding lands a few seconds after the wallet exists; wait for it (up to ~12 s) so the
		// page shows the balance and the funding entry instead of an empty wallet.
		for (let attempt = 0; attempt < 6; attempt++) {
			const ledger = await axiousAuth.get("/transaction?page=1&limit=1&type=funding").catch(() => null);
			const rows = ledger?.data?.data?.items ?? ledger?.data?.data?.data ?? [];
			if (rows.length) break;
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
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

interface WalletExportResponse {
	message: string;
	data: { private_key: string; wallet_address: string };
}

/** The API returns the keys as JSON; the PDF is drawn here, in memory, and never stored or logged. */
export const useExportWalletKeys = () => {
	const { get } = useAxiosAuth();

	const walletId = useAuthStore((state) => state.credentials?.user?.wallet?.id);

	return useMutation({
		retry: false,
		mutationFn: async () => {
			const response = await get<WalletExportResponse>(`/wallet/export/${walletId}`);
			const { private_key, wallet_address } = response.data.data ?? {};
			if (!private_key || !wallet_address) throw new Error("The wallet keys could not be read.");

			const { default: jsPDF } = await import("jspdf");
			const doc = new jsPDF();
			const width = doc.internal.pageSize.getWidth() - 28;

			doc.setFontSize(18);
			doc.text("Stellance wallet keys", 14, 22);
			doc.setFontSize(10);
			doc.setTextColor(110);
			doc.text(`Exported on ${new Date().toLocaleString()} · Stellar Testnet`, 14, 30);

			doc.setTextColor(20);
			doc.setFontSize(11);
			doc.text("Public address", 14, 46);
			doc.setFont("courier", "normal");
			doc.text(doc.splitTextToSize(wallet_address, width), 14, 53);

			doc.setFont("helvetica", "normal");
			doc.text("Secret key", 14, 70);
			doc.setFont("courier", "bold");
			doc.text(doc.splitTextToSize(private_key, width), 14, 77);

			doc.setFont("helvetica", "normal");
			doc.setFontSize(10);
			doc.setTextColor(150, 30, 30);
			doc.text(
				doc.splitTextToSize("Keep this file secure and never share it. Anyone with the secret key can move the funds in this wallet.", width),
				14,
				94,
			);

			doc.save("stellance-wallet-keys.pdf");
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