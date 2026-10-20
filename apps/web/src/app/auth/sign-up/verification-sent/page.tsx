"use client";

import { useEffect, useState } from "react";
import { Button } from "@repo/ui/button";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/lib/use-toast";
import { backendRoutes } from "@/lib/routes";
import { axiosInstance } from "@/lib/api/client";
import axios from "axios";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // in seconds
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const toast = useToast();

  const resendLink = async () => {
    if (cooldown > 0) return; // prevent clicking during cooldown

    setLoading(true);
    try {
      const res = await axiosInstance.get(
        backendRoutes.AUTH_ROUTES.RESEND_VERIFICATION_LINK(email)
      );

      if (res.data) {
        toast.success(res?.data?.message);
        setCooldown(60); // start cooldown after success
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Timer logic for countdown
  useEffect (() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <div className="mt-10">
      <h2 className="h2-auth text-center">Email Verification Required</h2>
      <p className="mt-[30px] text-sm text-center sm:text-xl md:2xl">
        A verification email has been sent to
        <br />
        <span className="font-bold">{email}</span>
        <br />
        <br />
        Please follow the instructions in the verification email to complete
        your account creation.
        <br />
        <br />
        Can&apos;t find email? Check your spam, junk, bulk or promotions folder
        <br />
        <br />
        Didn&apos;t receive an email?
      </p>

      <div className="flex justify-center mt-[60px]">
        <Button
          onClick={resendLink}
          isLoading={loading}
          className="max-w-[500px]"
          disabled={cooldown > 0}
        >
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend Verification Email"}
        </Button>
      </div>
    </div>
  );
}
