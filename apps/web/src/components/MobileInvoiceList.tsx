"use client";
import { StatusBadge } from "@/components/InvoiceStatusBadge";
import { InvoiceType } from "@/features/invoice/types";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { useRouter } from "next/navigation";
import { invoiceRoutes } from "@/lib/routes";
import { InvoicePaymentStatus } from "@/features/payments/components/InvoicePaymentStatus";

interface InvoiceCardProps {
  invoice: InvoiceType;
}

// const InvoiceList: React.FC<InvoiceType> = (inv) => {
const InvoiceList = ({ invoice }: InvoiceCardProps) => {
  const router = useRouter();

  // Paid invoices used to open /receipts/[id], which doesn't exist; every invoice opens its preview.
  const previewInvoice = () => {
    router.push(invoiceRoutes.PREVIEW_INVOICE({ invoice_id: invoice.id || "" }));
  };

  return (
    <div
      onClick={previewInvoice}
      className="bg-primary-20 rounded-[5px] flex justify-between py-[15px] px-5 min-h-[110px] hover:bg-primary-500 hover:text-neutral-500 duration-150 cursor-pointer"
    >
      <div className="flex flex-col justify-between">
        <p className="text-xs leading-[25px] mt-1">{invoice.invoice_number}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={invoice.status || "pending"} variant="outlined" role="freelancer" />
          <InvoicePaymentStatus invoice={invoice} />
        </div>
        <p className="text-xs max-[350px]:mt-2">
          Date Issued: <br className="min-[350px]:hidden" />{" "}
          {formatDate(invoice.created_at)}
        </p>
      </div>
      <div className="flex flex-col items-end justify-between text-sm gap-1">
        <p>To:</p>
        <p className="font-bold">{invoice.payer_name}</p>
        <p className="font-bold">{formatCurrency(invoice.total || 0)}</p>
        <p className="text-xs text-end max-[350px]:mt-2">
          Due Date: <br className="min-[350px]:hidden" />{" "}
          {formatDate(invoice.due_date || "")}
        </p>
      </div>
    </div>
  );
};

export default InvoiceList;

export const MobileInvoiceSkeleton = () => {
  return (
    <div className="flex justify-between items-center bg-[#D9E4F866] rounded-[5px] px-[15px] py-3 animate-pulse xl:hidden">
      <div className="flex flex-col gap-4 justify-between">
        <div className="h-3 w-24 bg-gray-300 rounded"></div>
        <div className="h-5 w-16 bg-gray-300 rounded"></div>
      </div>
      <div className="flex flex-col gap-1 items-end text-end">
        <div className="h-3 w-10 bg-gray-300 rounded"></div>
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
        <div className="h-3 w-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};
