"use client";
/* eslint-disable @next/next/no-img-element -- merchant logos are blob, data or remote URLs that next/image cannot optimise */
import { withBasePath } from "@/lib/site";
import Logo from "@/components/Logo";
import { capitalizeWords, formatCurrency, formatDate, invoiceAmounts, numberToWordsUSD } from "@/lib/helpers";
import { InvoiceType } from "@/features/invoice/types";
import { overviewRoutes } from "@/lib/routes";

const Template01 = ({ invoice }: { invoice: InvoiceType }) => {
  // console.log(invoice);

  return (
    <div className="rounded-[5px]  pt-1.5 pb-10 sm:pt-4 lg:pt-6 invoice-shadow mx-auto md:rounded-[10px] lg:rounded-[20px] ">
      <div className="flex justify-between items-center px-2.5 md:px-4 lg:px-5">
        <Logo link={overviewRoutes.OVERVIEW} height="h-[18px]  sm:h-[24px] lg:h-[28px]" />
        <p className="font-bold text-lg lg:text-2xl text-primary-500">
          Stellance
        </p>
      </div>

      <section className="px-2.5 sm:px-4 lg:px-5 flex justify-between items-center mt-5 gap-10 md:mt-7 lg:mt-10">
        <div>
          <p className="font-bold text-sm sm:text-base lg:text-2xl text-primary-500">
            INVOICE
          </p>
          <p className="text-[10px] sm:text-sm lg:text-base text-neutral-900">
            Invoice No: {invoice?.invoice_number}
          </p>
          <p className="text-[8px] sm:text-xs lg:text-sm md:mt-1 font-light text-neutral-900">
            {capitalizeWords(invoice?.title || "")}
          </p>
          {/* <p className="text-[8px] sm:text-xs lg:text-sm md:mt-1 font-light text-neutral-900">
            Wallet Address: {maskMiddle(wallet?.address || "")}
          </p> */}
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`w-[45px] h-[35px] sm:h-[50px] sm:w-[60px] lg:w-20 lg:h-[70px] rounded-[3.35px] ${!invoice?.logo_url && "bg-primary-50"}`}
          >
            <img
              src={invoice?.logo_url || withBasePath("/images/logo-primary.svg")}
              alt={invoice?.title || ""}
              className="h-full w-full object-contain"
            />
          </div>{" "}
          <p className="text-[8px] sm:text-xs lg:text-sm mt-1.5 line-clamp-1 ">
            {capitalizeWords(
              invoice?.createdBy?.business_name ||
                invoice?.createdBy?.name ||
                "",
            )}
          </p>
        </div>
      </section>

      <hr className="mt-3 text-neutral-700 md:mt-5 lg:mt-8" />

      {/* client details */}
      <section className="mt-5 md:mt-10 flex justify-between px-2.5 md:px-4">
        <div className="text-[10px] sm:text-sm lg:text-base font-light">
          <p>Billed By:</p>
          <p className="font-medium">
            {capitalizeWords(invoice?.createdBy?.name || "")}
          </p>
          <p>{invoice?.createdBy?.email || ""}</p>
          <p>{capitalizeWords(invoice?.createdBy?.location || "")}</p>
          <p className="mt-4 md:mt-10">
            Date Issued: <br />{" "}
            <span className="font-medium">
              {formatDate(invoice?.created_at || "")}
            </span>{" "}
          </p>
        </div>
        {/*  */}
        <div className="text-[10px] sm:text-sm lg:text-base font-light flex flex-col">
          <p>Billed To:</p>
          <p className="font-medium">{invoice?.payer_name || ""}</p>
          <p>{invoice?.payer_email || ""}</p>
          <p>{capitalizeWords(invoice?.country || '')}</p>
          <p className="mt-4 md:mt-10">
            Due Date: <br />{" "}
            <span className="font-medium">
              {formatDate(invoice?.due_date || "")}
            </span>{" "}
          </p>
        </div>
      </section>

      <section className="mt-8 px-2 lg:mt-12 lg:px-4">
        {invoice && <InvoiceItems inv={invoice} />}
        {/* <InvoiceItems /> */}
      </section>

      <section className="px-2.5 md:px-4 text-sm sm:text-base text-neutral-900 mt-5">
        <h5>Note:</h5>
        <p className="italic">{invoice?.note || ""}</p>
      </section>
    </div>
  );
};

export default Template01;

function InvoiceItems({ inv }: { inv: InvoiceType }) {
  // function InvoiceItems() {
  // The API's amounts: the client pays `total`. The Stellance fee is the merchant's and never shows here.
  const { subtotal: subTotal, clientPays: total } = invoiceAmounts(inv);
  // Invoices made before the fee moved to the merchant had it added to the client's total.
  const addedFee = Math.max(total - subTotal, 0);

  return (
    <div className="bg-[#D9E4F8] rounded-[5px] pb-12 lg:pb-[83px]">
      <div className="overflow-x-auto scroll pb-4">
        <table className=" bg-[#D9E4F8] min-w-full border-collapse border-spacing-y2 overflow-hidden rounded-[5px]">
          <thead className="bg-[#D1E2FF] overflow-hidden ">
            <tr className="">
              <th
                scope="col"
                className="px-2 py-[15px] text-xs  lg:text-base text-center font-bold whitespace-nowrap "
              >
                Type
              </th>
              <th
                scope="col"
                className="px-4 py-[15px] text-sm lg:text-base text-center font-bold whitespace-nowrap "
              >
                Description
              </th>
              <th
                scope="col"
                className="px-4 py-[15px] text-sm lg:text-base text-center font-bold whitespace-nowrap "
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-4 py-[15px] text-sm lg:text-base text-center font-bold whitespace-nowrap "
              >
                Unit Price
              </th>
              <th
                scope="col"
                className="px-4 py-[15px] text-sm lg:text-base text-center font-bold whitespace-nowrap "
              >
                Discount (%)
              </th>
              <th
                scope="col"
                className="px-4 py-[15px] text-sm lg:text-base text-center font-bold whitespace-nowrap "
              >
                Amount
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          {/* <tbody className="divide-y divide-[#BFBFBF99]"> */}
          <tbody className="divide-y divide-neutral-600">
            {inv?.items?.map((inv, i) => (
              <tr key={i} className="bg-primary-50 font-medium">
                <td className="px-4 py-[15px] whitespace-nowrap text-xs lg:text-base text-center">
                  {inv.invoice_type === "per_unit" ? "Per Unit" : "Per Hour"}
                </td>
                <td className="px-4 py-[15px] whitespace-nowrap text-xs lg:text-base text-center">
                  {inv.description || ""}
                </td>
                <td className="px-4 py-[15px] text-xs lg:text-base text-center">
                  {inv.quantity || 0}
                </td>
                <td className="px-4 py-[15px] text-xs lg:text-base text-center">
                  {formatCurrency(inv.unit_price || 0)}
                </td>
                <td className="px-4 py-[15px] text-xs lg:text-base text-center">
                  {inv.discount || 0}
                </td>
                <td className="px-4 py-[15px] text-xs lg:text-base text-center">
                  {formatCurrency(inv.amount || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-red400 w-full custom-container">
        <div className="flex justify-end py-[18px]">
          <div className="flex items-center gap-[81px] justify-end">
            <p className="text-xs font-bold text-text-strong lg:text-lg">
              Sub Total
            </p>
            <p className="text-xs font-bold text-text-strong lg:text-lg">
              {formatCurrency(subTotal || 0)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <hr className="text-[#BFBFBF99] w-[230px] lg:w-[558px]" />
      </div>
      {addedFee > 0 && (
        <div className="flex justify-end py-[18px] custom-container">
          <div className="flex items-center gap-[81px] justify-end">
            <p className="text-xs font-bold text-text-strong lg:text-lg">Service Fee</p>
            <p className="text-xs font-bold text-text-strong lg:text-lg">{formatCurrency(addedFee)}</p>
          </div>
        </div>
      )}
      <div className="custom-container mt-2 w-full flex flex-col items-end justify-end">
        <div className="w-full max-w-[273px] lg:max-w-[558px] flex justifybetween h-[43px] overflow-hidden items-center rounded-[6px] ">
          <h5 className="text-sm font-bold leading-[25px] py-3 px-4 w-20 text-white bg-primary-500 md:text-lg">
            Total
          </h5>
          <h5 className="truncate w-full text-end text-sm font-bold leading-[25px] md:text-base lg:text-lg py-3 px-4 bg-white text-text-strong">
            {formatCurrency(total || 0)}
          </h5>
        </div>

        <p className="text-xs font-medium text-end italic mt-2 md:mt-5 md:text-sm lg:text-base">
          {numberToWordsUSD(total)}
        </p>
      </div>
    </div>
  );
}
