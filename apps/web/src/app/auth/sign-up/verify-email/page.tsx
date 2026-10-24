"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { axiosInstance } from "@/lib/api/client";
import axios from "axios";
import { useToast } from "@/lib/use-toast";
import { authRoutes, backendRoutes } from "@/lib/routes";
import { Button } from "@repo/ui/button";

// import Link from "next/link";
// verify-email?email=laye@gmail.com&token=f0+-d312e@984513my491731035bao

export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const email = decodeURIComponent(params.get("email") || "");
  const token = decodeURIComponent(params.get("token") || "");
  const toast = useToast();

  // console.log(token);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        backendRoutes.AUTH_ROUTES.VALIDATE_TOKEN(token, email)
      );
      // console.log(res)
      if (res.data) {
        setLoading(false);
        toast.success(res?.data?.message);
        router.push(authRoutes.LOGIN);
      }
      // console.log(res);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      toast.error(errorMessage);
      //   console.log(error?.response?.data);
    }
  };

  return (
    <div className="mt-40">
      <h2 className="h2-auth text-center">Verify Email</h2>
      <p className="mt-[30px] text-sm text-center sm:text-xl md:2xl">
        Click the button below to verify your email address:
        <br />
        <br />
        <span className="font-bold">{email}</span>
        <br />
      </p>

      <div className="flex justify-center mt-[60px]">
        <Button
          onClick={handleVerify}
          isLoading={loading}
          className="max-w-[500px]"
        >
          Verify Email
        </Button>
      </div>
    </div>
  );
}
