"use client";

import { useParams } from "next/navigation";
import CreateInvoiceFormDesktop from "@/features/invoice/components/createInvoice/desktop/CreateInvoiceFormDesktop";
import CreateInvoiceFormMobile from "@/features/invoice/components/createInvoice/mobile/CreateInvoiceFormMobile";
import { useMediaQuery } from "@/lib/use-media-query";
import { InvoiceType } from "@/features/invoice/types";
import { useGetInvoice } from "@/features/invoice/hooks";

export default function Page() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const params = useParams();
  const id = Array.isArray(params.invoiceId)
    ? params.invoiceId[0]
    : params.invoiceId;

  const { data } = useGetInvoice({ invoice_id: id || "" });
  const invoice: InvoiceType = data;
  // console.log(invoice);

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
