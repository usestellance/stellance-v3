"use client";
import { withBasePath } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useGetInvoiceForClient } from "@/features/invoice/hooks";
import { InvoiceType } from "@/features/invoice/types";
import { PaymentRequest } from "@/features/payments/components/PaymentRequest";
import { Button } from "@repo/ui/button";
import PageLoading from "@/components/PageLoading";
import { overviewRoutes } from "@/lib/routes";

export default function Page() {
  const router = useRouter();
  const { id } = useParams();
  const { data, isLoading, isError } = useGetInvoiceForClient({
    invoice_url: id?.toString() || "",
  });

  const invoice: InvoiceType = data;


  return (
    <div className="pt-5 pb-20 lg:pt-10">
      {isLoading && <PageLoading />}
      {isError && (
        <div className="landing-container">
          <Link href={overviewRoutes.OVERVIEW}>
            <div className="w-14 lg:w-20">
              <Image
                src={withBasePath("/images/logo-primary-header.svg")}
                alt="Stellance Logo"
                width={100}
                loading="eager"
                height={100}
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <div className=" flex flex-col items-center mt-20 lg:mt-10 justify-center max-w-[500px] mx-auto">
            <h1 className="text-center font-bold text-[64px] text-primary-500 lg:text-[128px]">
              404
            </h1>
            <p className="text-center font-light lg:text-[36px]">
              Sorry, the content you&apos;re looking for doesn&apos;t exist.
              <br className="max-lg:hidden" /> Either it was removed, or you
              mistyped the link.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="max-w-[250px] sm:max-w-[500px] mt-10"
            >
              Go Back Home
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="custom-container">
          <Link href="/">
            <div className="w-14 lg:w-20">
              <Image
                src={withBasePath("/images/logo-primary-header.svg")}
                alt="Stellance Logo"
                width={100}
                loading="eager"
                height={100}
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          <PaymentRequest invoice={invoice} />
        </div>
      )}
    </div>
  );
}
