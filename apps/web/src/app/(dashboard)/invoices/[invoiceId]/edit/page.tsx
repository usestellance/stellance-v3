"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import CreateInvoiceFormDesktop from "@/features/invoice/components/createInvoice/desktop/CreateInvoiceFormDesktop";
import CreateInvoiceFormMobile from "@/features/invoice/components/createInvoice/mobile/CreateInvoiceFormMobile";
import InvoiceSkeletonLoader from "@/components/InvoiceSkeletonLoader";
import { useMediaQuery } from "@/lib/use-media-query";
import { InvoiceType, isInvoiceEditable } from "@/features/invoice/types";
import { useGetInvoice } from "@/features/invoice/hooks";
import { invoiceRoutes } from "@/lib/routes";

export default function Page() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const params = useParams();
  const id = Array.isArray(params.invoiceId)
    ? params.invoiceId[0]
    : params.invoiceId;

  const { data, isLoading } = useGetInvoice({ invoice_id: id || "" });
  const invoice: InvoiceType = data;

  if (isLoading) {
    return (
      <div className="pt-8 pb-20 custom-container">
        <InvoiceSkeletonLoader />
      </div>
    );
  }

  // The API locks an invoice once it is sent; say so instead of a form whose save would fail.
  if (invoice && !isInvoiceEditable(invoice)) {
    return (
      <div className="pt-20 pb-20 custom-container flex flex-col items-center gap-4 text-center">
        <h2 className="text-xl font-bold text-primary-500 sm:text-2xl">This invoice can no longer be edited</h2>
        <p className="max-w-[460px] text-neutral-900">
          Only drafts can be edited. Once an invoice has been sent, your client already has it.
        </p>
        <Link
          href={invoiceRoutes.PREVIEW_INVOICE({ invoice_id: id || "" })}
          className="font-medium text-primary-500 underline underline-offset-4"
        >
          Back to the invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-20">
      {isDesktop ? (
        <CreateInvoiceFormDesktop invoice={invoice} edit={true} />
      ) : (
        <CreateInvoiceFormMobile invoice={invoice} edit={true} />
      )}
    </div>
  );
}
