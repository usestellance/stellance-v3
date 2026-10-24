"use client";
import { withBasePath } from "@/lib/site";
import Image from "next/image";
import React from "react";
import { Button } from "@repo/ui/button";
import { useGenerateWallet } from "@/features/wallet/hooks";
import { useAuthStore } from "@/features/auth/store";
import { authRoutes } from "@/lib/routes";
import { useRouter } from "next/navigation";

const NoWalletAddress = () => {
  const router = useRouter();
  const credentials = useAuthStore((state) => state.credentials);
  const { mutate, isPending } = useGenerateWallet();
  
  const handleGenerateWallet = () => {
    if (credentials?.user?.profile_complete) {
      mutate();
    } else {
      router.push(authRoutes.COMPLETE_PROFILE);
    }
  };

  return (
    <div>
      <h2 className="h2-app">Wallet</h2>
      <div className="flex flex-col items-center mt-[108px]">
        <div className="w-full max-w-[300px] md:max-w-[500px]">
          <Image
            src={withBasePath("/images/no-wallet-address.svg")}
            alt="No wallet illustration"
            height={500}
            width={500}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex justify-center w-full mt-5">
          <Button
            isLoading={isPending}
            disabled={isPending}
            onClick={handleGenerateWallet}
            className="max-w-[250px] md:max-w-[450px]"
          >
            Generate Wallet Address
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoWalletAddress;
