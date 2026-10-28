"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PayerWalletId } from "@/features/payer-wallet/kit";

interface PayerWalletState {
	/** Public address of the payer's own wallet (G…). Never a secret; Stellance never sees a payer's keys. */
	address: string | null;
	walletId: PayerWalletId | null;
	setConnected: (address: string, walletId: PayerWalletId) => void;
	clear: () => void;
}

/** The client's connected wallet on the payment page, kept across reloads (a phone wallet may reload the tab). */
export const usePayerWallet = create<PayerWalletState>()(
	persist(
		(set) => ({
			address: null,
			walletId: null,
			setConnected: (address, walletId) => set({ address, walletId }),
			clear: () => set({ address: null, walletId: null }),
		}),
		{ name: "stellance-payer-wallet", storage: createJSONStorage(() => localStorage) },
	),
);
