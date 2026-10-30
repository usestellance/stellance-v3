"use client";
import React from "react";
import NoWalletAddress from "@/features/wallet/components/NoWalletAddress";
import { useAuthStore } from "@/features/auth/store";
import WalletPreview from "@/features/wallet/components/WalletPreview";

export default function Page() {
  const credentials = useAuthStore((state) => state.credentials);

  if (!credentials?.user?.wallet?.address)
    return (
      <div className="pt-5 pb-20">
        <div className="custom-container">
          <NoWalletAddress />
        </div>
      </div>
    );

  return (
    <div className="pt-5 pb-20">
      <div className="custom-container">
        <WalletPreview />
      </div>
    </div>
  );
}
