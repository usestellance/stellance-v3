"use client";
import Link from "next/link";
import SignUpForm from "@/features/auth/components/SignUpForm";
import { authRoutes } from "@/lib/routes";

export default function Page() {
  return (
    <div className="w-full bggreen-500">
      <h2 className="font-bold text-[28px] md:text-[36px]">Get Started</h2>
      <p className="text-sm text-black-400 md:text-base">
        Already using Stellance?{" "}
        <Link href={authRoutes.LOGIN} className="font-bold  text-black-500">
          Sign in
        </Link>
      </p>

      <div className="mt-[30px] w-full">
        <SignUpForm />
      </div>
    </div>
  );
}
