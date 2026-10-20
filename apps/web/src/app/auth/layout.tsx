import React from "react";
import Logo from "@/components/Logo";
// import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen flex overflow-hidden">
      <div className="bg-red500 overflow-y-auto hide-scroll relative custom-container sm:max-w-[600px] min-h-full w-full lg:w-1/2 pb-20">
        <div className=" bg-green400 py-5 max-sm:mb-5  md:py-10 xl:py-14 flex flex-col bg-geen-300 w-fit items-center">
          <Logo link="/" height="h-[30px] md:h-[40px]" />
          <p className="font-bold max-md:hidden">Stellance</p>
        </div>
        <div className="max-w-[500px] mx-auto">{children}</div>
      </div>
      <div
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), url('/images/auth-bg-2.png')",
          // "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url('/images/auth-bg.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="max-lg:hidden w-1/2 bg-primary-600"
      ></div>
    </main>
  );
}
