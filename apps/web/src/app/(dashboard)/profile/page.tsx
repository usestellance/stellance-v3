import React from "react";
import UpdateUserForm from "@/features/auth/components/UpdateUserForm";

export default function Page() {
  return (
    <div className="pt-5 pb-20">
      <div className="custom-container">
        <section className="py-[15px] flex justify-between gap-2 items-center">
          <h2 className="h2-app">Profile</h2>
        </section>

        <section className="lg:mt-[30px]">
          <UpdateUserForm />
        </section>
      </div>
    </div>
  );
}
