"use client";

import Link from "next/link";
import { authRoutes } from "@/lib/routes";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export default function Page() {
  return (
    <div className="w-full max-lg:mt-10">
      <h2 className="h2-auth mb-1">Create New Password</h2>
      <p className="text-sm text-black-400 md:text-base">
        Enter the OTP sent to your email and set your new password for your
        account, use at least 8 characters with a mix of letters, numbers and
        symbols.
      </p>

      <div className="mt-[30px] w-full">
        <ResetPasswordForm />
      </div>

      <div className="mt-[30px] lg:mt-[60px] underline font-bold underline-offset-4 text-center lg:text-lg">
        <Link href={authRoutes.LOGIN}>Sign in</Link>
      </div>
    </div>
  );
}
