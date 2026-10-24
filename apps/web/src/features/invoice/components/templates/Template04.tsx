/* eslint-disable @next/next/no-img-element -- merchant logos are blob, data or remote URLs that next/image cannot optimise */
import { withBasePath } from "@/lib/site";
import Logo from "@/components/Logo";
import {
  capitalizeWords,
  formatCurrency,
  formatDate,
  numberToWordsUSD,
} from "@/lib/helpers";
import { SERVICE_CHARGE } from "@/lib/constants";
import { InvoiceType } from "@/features/invoice/types";
import { overviewRoutes } from "@/lib/routes";

const Template04 = ({ invoice }: { invoice: InvoiceType }) => {
  // console.log(invoice);

  return (
    <div className="rounded-[5px]  pt-1.5 pb-10 sm:pt-4 lg:pt-6 invoice-shadow mx-auto md:rounded-[10px] lg:rounded-[20px] ">
      <div className="flex justify-between items-center px-2.5 md:px-4 lg:px-5">
        <Logo link={overviewRoutes.OVERVIEW} height="h-[18px]  sm:h-[24px] lg:h-[28px]" />
        <p className="font-bold text-lg lg:text-2xl text-primary-500">
          Stellance
        </p>
      </div>

      <section className="px-2.5 sm:px-4 lg:px-5 flex justify-between mt-5 gap-10 md:mt-7 lg:mt-10">
        <div>
          <p className="font-bold text-sm sm:text-base lg:text-2xl text-primary-500">
            INVOICE
          </p>
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
          </div>
          <p className="text-[8px] sm:text-xs lg:text-sm mt-1.5 line-clamp-1">
            {capitalizeWords(
              invoice?.createdBy?.business_name ||
                invoice?.createdBy?.name ||
                "",
            )}
          </p>
        </div>
      </section>

      {/* client details */}
      <section className="mt-5 md:mt-10 flex flex-col justify-between px-2.5 md:px-4">
        <div className="flex justify-between">
          <div className="text-[10px] sm:text-sm lg:text-base font-light">
            <p>From:</p>
            <p className="font-medium">
              {capitalizeWords(invoice?.createdBy?.name || "")}
            </p>
            <p>{invoice?.createdBy?.email || ""}</p>
            <p>{capitalizeWords(invoice?.createdBy?.location || "")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="flex justify-between text-[10px] sm:text-sm lg:text-base gap-1">
              <span>Invoice No:</span>{" "}
              <span>{invoice?.invoice_number || "#####"} </span>
            </p>
            <p className="flex justify-between text-[10px] sm:text-sm lg:text-base">
              <span>Issued Date:</span>{" "}
              <span className="font-medium">
                {formatDate(invoice?.created_at || "")}
              </span>{" "}
            </p>
            <p className="flex justify-between text-[10px] sm:text-sm lg:text-base">
              <span>Due Date:</span>
              <span className="font-medium">
                {formatDate(invoice?.due_date || "")}
              </span>{" "}
            </p>
            <p className="text-[8px] sm:text-xs lg:text-sm md:mt-1 ">
              {invoice?.title || ""}
            </p>
          </div>
        </div>
        {/*  */}
        <div className="mt-4 text-[10px] sm:text-sm lg:text-base font-light flex flex-col">
          <p>Billed To:</p>
          <p className="font-medium">
            {capitalizeWords(invoice?.payer_name || "")}
          </p>
          <p>{invoice?.payer_email || ""}</p>
          <p>{capitalizeWords(invoice?.country || "")}</p>
        </div>
      </section>

      <section className="mt-8 px-2 lg:mt-12 lg:px-4">
        <InvoiceItems inv={invoice} />
        {/* <InvoiceItems /> */}
      </section>

      <section className="px-2.5 md:px-4 text-sm sm:text-base text-neutral-900 mt-5">
        <h5>Note:</h5>
        <p className="italic">{invoice?.note || ""}</p>
      </section>
    </div>
  );
};

export default Template04;

function InvoiceItems({ inv }: { inv: InvoiceType }) {
  // function InvoiceItems() {
  const subTotal = inv?.items?.reduce((acc, item) => {
    const unitPrice = Number(item.unit_price) || 0;
    const quantity = Number(item.quantity) || 0;
    const discount = Number(item.discount) || 0;

    const amountBeforeDiscount = unitPrice * quantity;
    const discountAmount = (discount / 100) * amountBeforeDiscount;

    return acc + (amountBeforeDiscount - discountAmount);
  }, 0);

  // 2. Calculate service fee
  const serviceFee = (SERVICE_CHARGE / 100) * (subTotal || 0);

  // 3. Calculate total
  const total = (subTotal || 0) - serviceFee;

  return (
    <div className=" rounded-[5px] pb-12 lg:pb-[83px]">
      <div className="overflow-x-auto scroll pb-4">
        <table className="  min-w-full border-collapse border-spacing-y2 overflow-hidden rounded-[5px]">
          <thead className=" overflow-hidden ">
            <tr className="">
              <th
                scope="col"
                className="px-2 py-[15px] text-xs  lg:text-base text-center font-bold whitespace-nowrap "
              >
                SN
              </th>
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
                Unit Price
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
              <tr key={i} className=" font-medium">
                <td className="px-4 py-[15px] whitespace-nowrap text-xs lg:text-base text-center">
                  {i + 1}
                </td>
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
      <div className="bg-red400 w-full custom-container bg-primary-20">
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

      <div className="flex justify-end py-[18px] custom-container bg-primary-20">
        <div className="flex items-center gap-[81px] justify-end">
          <p className="text-xs font-bold text-text-strong lg:text-lg">{`Service Fee (${SERVICE_CHARGE}) %`}</p>
          <p className="text-xs font-bold text-text-strong lg:text-lg">
            {/* {formatCurrency(inv?.service_fee || 0)} */}
            {formatCurrency(serviceFee)}
          </p>
        </div>
      </div>
      <div className="custom-container w-full flex flex-col items-end justify-end bg-primary-20 md:pt-4">
        <div className="w-full max-w-[273px] lg:max-w-[558px] flex justifybetween h-[43px] overflow-hidden items-center rounded-tl-[6px] rounded-bl-[6px] ">
          <h5 className="text-sm font-bold leading-[25px] py-3 px-4 w-20 text-white bg-primary-500 md:text-lg">
            Total
          </h5>
          <h5 className="truncate w-full text-end text-sm font-bold leading-[25px] md:text-base lg:text-lg py-3 px-4 bg-primary-500 text-white">
            {formatCurrency(total || 0)}
          </h5>
        </div>

        <p className="text-xs font-medium text-end italic mt-2 md:mt-5 md:text-sm lg:text-base pb-4 md:pb-8">
          {numberToWordsUSD(total)}
        </p>
      </div>
    </div>
  );
}
