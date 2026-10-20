"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  useGetInvoiceForClient,
  useReviewInvoice,
} from "@/features/invoice/hooks";
import Link from "next/link";
import Image from "next/image";
import { InvoiceType } from "@/features/invoice/types";
import Template02 from "@/features/invoice/components/templates/Template02";
import Template03 from "@/features/invoice/components/templates/Template03";
import Template04 from "@/features/invoice/components/templates/Template04";
import Template05 from "@/features/invoice/components/templates/Template05";
import Template01 from "@/features/invoice/components/templates/Template01";
import PageLoading from "@/components/PageLoading";
import { StatusBadge } from "@/components/InvoiceStatusBadge";
import { getDueStatus } from "@/lib/helpers";
import { Button } from "@repo/ui/button";
import { clientRoutes, overviewRoutes } from "@/lib/routes";
import { IoIosCloseCircleOutline } from "react-icons/io";
import InvoiceSkeletonLoader from "@/components/InvoiceSkeletonLoader";
import CommentsPreview from "@/features/invoice/components/comments/CommentsPreview";

export default function Page() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const [activeTab, setActiveTab] = useState<"invoice" | "comment">("invoice");
  const { data, isLoading, isError } = useGetInvoiceForClient({
    invoice_url: id?.toString() || "",
  });
  const [approve, setApprove] = useState<boolean>(true);
  const invoice: InvoiceType = data;

  // console.log("invoice", name, data?.payer_email?.split("@")[0] === name);

  const isPayer = data?.payer_email?.split("@")[0] === name;

  const { mutate, isPending } = useReviewInvoice(
    invoice?.id?.toString() || "",
    approve,
  );

  const handleReviewInvoice = (status: boolean) => {
    setApprove(status);
    mutate();
    // window.location.reload();
  };

  const getTemplate = () => {
    switch (invoice?.template_id) {
      case "template_002":
        return <Template02 invoice={invoice} />;
      case "template_003":
        return <Template03 invoice={invoice} />;
      case "template_004":
        return <Template04 invoice={invoice} />;
      case "template_005":
        return <Template05 invoice={invoice} />;
      default:
        return <Template01 invoice={invoice} />;
    }
  };

  //   console.log(id);
  // console.log(data);
  return (
    <div className="pt-5 pb-20 lg:pt-10">
      {isLoading && (
        <div className="landing-container">
          <Link href={overviewRoutes.OVERVIEW} className="mb-10 inline-block">
            <div className="w-14 lg:w-20">
              <Image
                src="/images/logo-primary-header.svg"
                alt="Stellance Logo"
                width={100}
                loading="eager"
                height={100}
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <InvoiceSkeletonLoader />
        </div>
      )}
      {isError && (
        <div className="landing-container">
          <Link href="/">
            <div className="w-14 lg:w-20">
              <Image
                src="/images/logo-primary-header.svg"
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
                src="/images/logo-primary-header.svg"
                alt="Stellance Logo"
                width={100}
                loading="eager"
                height={100}
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <>
            <section className="mt-10 md:mt-20 max-w-[800px] mx-auto flex place-selfstart w-full justify-between items-center">
              <StatusBadge
                status={invoice?.status || "draft"}
                variant="filled"
                role="client"
              />

              <div className="bg-orange-500 text-neutral-500 font-bold text-sm md:text-base px-[15px] py-1 md:px-[26.5px] md:py-1 rounded-[20px]">
                {invoice?.status === "cancelled"
                  ? "No due date"
                  : getDueStatus(invoice?.due_date || "No due date")}
              </div>
            </section>
            {!isError && !isLoading && (
              <div className="flex justify-center my-[30px] lg:my-[60px]">
                <div className="h-10 bg-primary-50 w-full max-w-[180px] lg:h-12 lg:max-w-[400px] flex items-center rounded-[5px] overflow-hidden text-sm font-medium lg:text-xl cursor-pointer">
                  <button
                    onClick={() => setActiveTab("invoice")}
                    className={`flex-1 h-full duration-150 transition-all  ${activeTab === "invoice" && "bg-primary-500 text-white"} `}
                  >
                    Invoice
                  </button>
                  <button
                    onClick={() => setActiveTab("comment")}
                    className={`flex-1 h-full duration-150 transition-all ${activeTab === "comment" && "bg-primary-500 text-white"} `}
                  >
                    Comments
                  </button>
                </div>
              </div>
            )}
            {activeTab === "invoice" ? (
              <section
                className={`mt-10 sm:mt-16  px-2 min-w-[270px] mx-auto max-w-[800px] `}
              >
                {getTemplate()}
              </section>
            ) : (
              <section className="mt-8 px-2 min-w-[270px] mx-auto max-w-[800px]">
                <CommentsPreview invoice_id={data?.id || ""} />
              </section>
            )}
            {isPayer && (
              <section className="mt-10 sm:mt-16 lg:mt-[60px]">
                {invoice?.status === "sent" && (
                  <div className="flex gap-[30px] justify-center">
                    <Button
                      onClick={() => handleReviewInvoice(false)}
                      disabled={isPending}
                      variant="outline"
                      className="in-app-btn"
                    >
                      Declined
                    </Button>

                    <Button
                      type="button"
                      className="in-app-btn"
                      onClick={() => handleReviewInvoice(true)}
                      disabled={isPending}
                    >
                      Approve
                    </Button>
                  </div>
                )}
                {invoice?.status === "viewed" && invoice?.approved && (
                  <div className="flex justify-center mt-14">
                    <Link
                      href={clientRoutes.MAKE_PAYMENT(id?.toString() || "")}
                      className="font-bold text-primary-500"
                    >
                      CLICK HERE TO PAY THIS INVOICE
                    </Link>
                  </div>
                )}
                {invoice?.status === "cancelled" && !invoice?.approved && (
                  <div className="flex flex-col items-center gap-3">
                    <IoIosCloseCircleOutline className="text-3xl text-error-500" />
                    <span className="text-sm font-bold">INVOICE DECLINED</span>
                  </div>
                )}
              </section>
            )}
          </>
        </div>
      )}
    </div>
  );
}
