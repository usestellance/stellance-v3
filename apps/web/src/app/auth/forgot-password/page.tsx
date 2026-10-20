"use client";

import Link from "next/link";
import { authRoutes } from "@/lib/routes";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export default function Page() {
  return (
    <div className="w-full max-lg:mt-10">
      <h2 className="h2-auth mb-1">Forgot Password</h2>
      <p className="text-sm text-black-400 md:text-base">
        Enter the email address you registered with and instructions to reset
        your password would be sent to your mail
      </p>

      <div className="mt-[30px] w-full">
        <ForgotPasswordForm />
      </div>

      <div className="mt-[30px] lg:mt-[60px] underline font-bold underline-offset-4 text-center lg:text-lg">
        <Link href={authRoutes.LOGIN}>Sign in</Link>
      </div>
    </div>
  );
}
