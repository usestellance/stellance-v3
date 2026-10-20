"use client";

import SetUpAccountForm from "@/features/auth/components/SetUpAccountForm";

export default function Page() {
  return (
    <div className="w-full max-lg:mt-10">
      <h2 className="h2-auth mb-1">Set up your account</h2>
      <p className="text-sm text-black-400 md:text-base">
        Enter all Required Details``
      </p>

      <div className="mt-[30px] w-full">
        <SetUpAccountForm />
      </div>

    </div>
  );
}
