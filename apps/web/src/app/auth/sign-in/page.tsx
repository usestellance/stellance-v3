"use client";
import Link from "next/link";
import { authRoutes } from "@/lib/routes";
import SignInForm from "@/features/auth/components/SignInForm";
import { DemoAccountNote } from "@/features/auth/components/DemoAccountNote";

export default function Page() {
  return (
    <div className="w-full max-lg:mt-10">
      <h2 className="h2-auth mb-1">Welcome Back!</h2>
      <p className="text-sm text-black-400 md:text-base">
        Don&apos;t have an account?{" "}
        <Link href={authRoutes.SIGN_UP} className="font-bold  text-black-500">
          Sign up
        </Link>
      </p>

      <div className="mt-[30px] w-full">
        <SignInForm />
      </div>

      <DemoAccountNote />
    </div>
  );
}
