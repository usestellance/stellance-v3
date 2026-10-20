import { create } from "zustand";

interface WalletStore {
  wallet: "$" | "xlm";
  setWallet: (newWallet: "$" | "xlm") => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallet: "$",
  setWallet: (newWallet) => set({ wallet: newWallet }),
}));
