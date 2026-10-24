"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Template05 from "@/features/invoice/components/templates/Template05";
import GoBack from "@/components/GoBack";
import { StatusBadge } from "@/components/InvoiceStatusBadge";
import Template01 from "@/features/invoice/components/templates/Template01";
import Template02 from "@/features/invoice/components/templates/Template02";
import Template04 from "@/features/invoice/components/templates/Template04";
import Template03 from "@/features/invoice/components/templates/Template03";
import {
  useDeleteInvoice,
  useGetInvoice,
  useSendInvoice,
} from "@/features/invoice/hooks";
import { Button } from "@repo/ui/button";
import SendInvoiceDialog from "@/features/invoice/components/SendInvoiceDialog";
import { getDueStatus } from "@/lib/helpers";
import { InvoiceType } from "@/features/invoice/types";
import { FiEdit } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { invoiceRoutes } from "@/lib/routes";
import DeleteInvoiceModal from "@/features/invoice/components/DeleteInvoiceModal";
import CommentsPreview from "@/features/invoice/components/comments/CommentsPreview";
import InvoiceSkeletonLoader from "@/components/InvoiceSkeletonLoader";
import { InvoicePaymentSummary } from "@/features/payments/components/InvoicePaymentSummary";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "comment" ? "comment" : "invoice";
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // console.log(tab);

  const id = Array.isArray(params.invoiceId)
    ? params.invoiceId[0]
    : params.invoiceId;

  const { data, isLoading, isError } = useGetInvoice({ invoice_id: id || "" });
  const invoice: InvoiceType = data;
  // console.log(invoice);
  const sendInvoiceMutation = useSendInvoice(id || "");

  const deleteInvoiceMutation = useDeleteInvoice(id || "");

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

  const handleSendInvoice = ({ emails }: { emails: string[] }) => {
    const recipients = emails;
    // 🔥 call API here
    sendInvoiceMutation.mutate({ emails: recipients });
  };

  const gotoEditInvoice = () => {
    router.push(invoiceRoutes.EDIT_INVOICE(id || ""));
  };

  const handleDeleteInvoice = () => {
    deleteInvoiceMutation.mutate();
  };

  const handleSwitchTabs = (activeTab: "invoice" | "comment") => {
    router.push(
      invoiceRoutes.PREVIEW_INVOICE({
        invoice_id: id || "",
        tab: activeTab,
        // tab: tab === "invoice" ? "comment" : "invoice",
      }),
    );
  };

  return (
    <>
      <div
        className={`pt-5 px-4 sm:px-[30px] lg:px-10  mx-auto pb-20 overflow-x-auto `}
      >
        <GoBack />

        {!isError && !isLoading && (
          <>
            <div className="mt-5 flex place-selfstart md:mt-10 w-full justify-between items-center">
              <StatusBadge
                status={invoice?.status || "draft"}
                variant="filled"
                role="freelancer"
              />

              <div className="bg-orange-500 text-neutral-500 font-bold text-sm md:text-base px-[15px] py-1 md:px-[26.5px] md:py-1 rounded-[20px]">
                {invoice?.status === "cancelled"
                  ? "No due date"
                  : getDueStatus(invoice?.due_date || "No due date")}
              </div>
            </div>
            <section className="mt-8 flex justify-between sm:text-lg font-semibold">
              <h3 className="">{invoice?.invoice_number}</h3>

              <div className="flex font-medium gap-2.5">
                {(invoice?.status === "draft" ||
                  invoice?.status === "sent") && (
                  <div
                    className="flex items-center gap-1 text-primary-500 cursor-pointer"
                    onClick={gotoEditInvoice}
                  >
                    <FiEdit className="text-[16px]" />

                    <span className="underline underline-offset-4 text-lg">
                      Edit
                    </span>
                  </div>
                )}

                {(invoice?.status === "sent" ||
                  invoice?.status === "draft") && (
                  <div
                    onClick={() => setOpenDeleteDialog(true)}
                    className="flex items-center cursor-pointer gap-1 text-error-400"
                  >
                    <AiOutlineDelete className="text-[16px]" />

                    <span className="underline underline-offset-4 text-lg">
                      Delete
                    </span>
                  </div>
                )}
              </div>
            </section>
            {invoice && <InvoicePaymentSummary invoice={invoice} />}
          </>
        )}

        {!isError && !isLoading && (
          <div className="flex justify-center my-[30px] lg:my-[60px]">
            <div className="h-10 bg-primary-50 w-full max-w-[180px] lg:h-12 lg:max-w-[400px] flex items-center rounded-[5px] overflow-hidden text-sm font-medium lg:text-xl cursor-pointer">
              <button
                onClick={() => handleSwitchTabs("invoice")}
                className={`flex-1 h-full duration-150 transition-all ${tab === "invoice" && "bg-primary-500 text-white"} `}
              >
                Invoice
              </button>
              <button
                onClick={() => handleSwitchTabs("comment")}
                className={`flex-1 h-full duration-150 transition-all ${tab === "comment" && "bg-primary-500 text-white"} `}
              >
                Comments
              </button>
            </div>
          </div>
        )}

        {isError && (
          <div className="text-center my-20 sm:text-lg">
            Unable to load invoice
          </div>
        )}

        {tab === "invoice" ? (
          isLoading ? (
            <InvoiceSkeletonLoader />
          ) : (
            <section
              className={`mt-8 px-2 min-w-[270px] ${tab === "invoice" ? "mx-auto md:max-w-[500px] lg:max-w-[650px] xl:max-w-[800px]" : ""}  `}
            >
              {getTemplate()}
            </section>
          )
        ) : (
          <section className="mt-8 px-2 min-w-[270px] mx-auto max-w-[1000px]">
            <CommentsPreview invoice_id={id || ""} />
          </section>
        )}

        {invoice?.status === "draft" && (
          <div className="flex gap-[30px] justify-center mt-10 lg:mt-[60px]">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="in-app-btn"
            >
              Close
            </Button>

            <Button
              type="button"
              className="in-app-btn"
              onClick={() => setOpenSendDialog(true)}
            >
              Send
            </Button>
          </div>
        )}
      </div>

      {/* ✅ Send Invoice Dialog */}
      <SendInvoiceDialog
        key={invoice?.payer_email ?? "loading"}
        open={openSendDialog}
        onOpenChange={setOpenSendDialog}
        onSend={handleSendInvoice}
        pending={sendInvoiceMutation.isPending}
        defaultEmail={invoice?.payer_email ?? ""}
      />
      {/* ✅ Delete Invoice Dialog */}
      <DeleteInvoiceModal
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onDelete={handleDeleteInvoice}
        pending={deleteInvoiceMutation.isPending}
      />
    </>
  );
}

// "use client";
// import { useParams, useRouter } from "next/navigation";
// import React from "react";
// import Template05 from "@/features/invoice/components/templates/Template05";
// import GoBack from "@/components/GoBack";
// import { StatusBadge } from "@/components/InvoiceStatusBadge";
// import { FiEdit } from "react-icons/fi";
// import { AiOutlineDelete } from "react-icons/ai";
// import Template01 from "@/features/invoice/components/templates/Template01";
// import Template02 from "@/features/invoice/components/templates/Template02";
// import Template04 from "@/features/invoice/components/templates/Template04";
// import Template03 from "@/features/invoice/components/templates/Template03";
// import { useGetInvoice } from "@/features/invoice/hooks";
// import { Button } from "@repo/ui/button";

// export default function Page() {
//   const router = useRouter();
//   const params = useParams();
//   const id = Array.isArray(params.invoiceId)
//     ? params.invoiceId[0]
//     : params.invoiceId;

//   const { data } = useGetInvoice({ invoice_id: id || "" });
//   const invoice = data;
//   // console.log('data',invoice);

//   const getTemplate = () => {
//     switch (invoice?.template_id) {
//       case "template_002":
//         return <Template02 invoice={invoice} />;
//       case "template_003":
//         return <Template03 invoice={invoice} />;
//       case "template_004":
//         return <Template04 invoice={invoice} />;
//       case "template_005":
//         return <Template05 invoice={invoice} />;
//       default:
//         return <Template01 invoice={invoice} />;
//     }
//   };

//   return (
//     <div className="pt-5 px-4 sm:px-[30px] lg:px-10 md:max-w-[500px]  lg:max-w-[650px] xl:max-w-[800px] mx-auto pb-20 overflow-x-auto">
//       <GoBack />
//       <div className="mt-5 flex place-self-start md:mt-10">
//         <StatusBadge status={invoice?.status || "draft"} variant="filled" />
//       </div>
//       <section className="mt-8 flex justify-between">
//         <h3 className="">{invoice?.invoice_number}</h3>
//         <div className="flex font-medium gap-2.5">
//           <div className="flex items-center gap-1 text-primary-500">
//             <FiEdit className="text-[16px]" />
//             <span className="underline underline-offset-4 text-lg">Edit</span>
//           </div>
//           <div className="flex items-center gap-1 text-error-400">
//             <AiOutlineDelete className="text-[16px]" />
//             <span className="underline underline-offset-4 text-lg">Delete</span>
//           </div>
//         </div>
//       </section>

//       <section className="mt-8 px-2 min-w-[270px]">{getTemplate()}</section>

//       {invoice?.status === "draft" && (
//         <div className="flex max-w-full gap-[30px]  justify-center mt-10 lg:mt-[60px]">
//           <Button
//             onClick={() => router.back()}
//             className="in-app-btn"
//             variant="outline"
//           >
//             Close
//           </Button>
//           <Button
//             type="button"
//             onClick={() => console.log("hish")}
//             className="in-app-btn"
//           >
//             Send
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }

// //Success in house of wonder
