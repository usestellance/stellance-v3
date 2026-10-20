"use client";
import { useParams } from "next/navigation";
import CreateInvoiceFormDesktop from "@/features/invoice/components/createInvoice/desktop/CreateInvoiceFormDesktop";
import CreateInvoiceFormMobile from "@/features/invoice/components/createInvoice/mobile/CreateInvoiceFormMobile";
import { useMediaQuery } from "@/lib/use-media-query";
import { useGetInvoice } from "@/features/invoice/hooks";
import { InvoiceType } from "@/features/invoice/types";

export default function Page() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="pt-8 pb-20">
      {isDesktop ? (
        <CreateInvoiceFormDesktop  />
      ) : (
        <CreateInvoiceFormMobile />
      )}
    </div>
  );
}
