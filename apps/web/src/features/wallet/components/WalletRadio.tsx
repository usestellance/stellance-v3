import React from "react";
import { useWalletStore } from "@/features/wallet/store";

const WalletRadio = () => {
  const { wallet, setWallet } = useWalletStore();

  const toggleWallet = () => {
    setWallet(wallet === "$" ? "xlm" : "$");
  };

  return (
    <div
      onClick={toggleWallet}
      className="relative text-white px-2.5 flex justify-between text-xs items-center h-[26px] bg-primary-500 w-20 rounded-[30px] font-medium cursor-pointer select-none gap-5"
    >
      <span className="ml-2">$</span>
      <span>XLM</span>

      <div
        className={`absolute top-px bottom-[1.5px] w-1/2 bg-white rounded-[30px] text-primary flex justify-center items-center transition-all duration-300 font-bold ${
          wallet === "$" ? "left-[0.5] translate-x-0 " : "translate-x-[72%]"
        }`}
      >
        {wallet.toUpperCase()}
      </div>
    </div>
  );
};

export default WalletRadio;
