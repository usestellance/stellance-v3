import { withBasePath } from "@/lib/site";
import React from "react";
import InvoiceCard from "@/components/MobileInvoiceList";
import InvoiceFilter from "@/features/invoice/components/InvoiceFilter";
import { DataTable } from "@/components/DesktopInvoiceList/data-table";
import { columns } from "@/components/DesktopInvoiceList/columns";
import { useInvoiceFilter } from "@/features/invoice/store";
import InvoicePagination from "@/features/invoice/components/InvoicePagination";
import Image from "next/image";
import { useGetInvoices } from "@/features/invoice/hooks";
import { InvoiceType } from "@/features/invoice/types";

const Invoices = () => {
  const { search, status } = useInvoiceFilter();
  const { data, isLoading, isError } = useGetInvoices({});
  const invoices = data?.invoice || [];
  const totalPages = data?.meta?.total_pages || 1;
  const isEmpty = invoices?.length === 0;

  // console.log(data);

  return (
    <div>
      <InvoiceFilter />
      {isLoading && (
        <div className="text-center mt-20">Loading invoices...</div>
      )}
      {isError && (
        <div className="text-center mt-20">Error loading invoices</div>
      )}
      {!isLoading && !isError && (
        <div className="mt-[30px]">
          {!isEmpty ? (
            <>
              {/* MOBILE LIST */}
              <div className="space-y-[15px] xl:hidden">
                {invoices?.map((inv: InvoiceType) => (
                  <InvoiceCard key={inv.id} invoice={inv} />
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="max-xl:hidden overflow-x-auto">
                {/* <DataTable data={filteredData} columns={columns} /> */}
                <DataTable<InvoiceType, InvoiceType> columns={columns} data={invoices} />
              </div>

              {totalPages > 1 && (
                <div className="mt-10 lg:mt-[60px]">
                  <InvoicePagination pageNumber={totalPages || 1} />
                </div>
              )}
            </>
          ) : (
            // EMPTY UI
            <div className="mt-14 flex flex-col items-center gap-8 md:mt-20 lg:mt-24 max-w-[163px] mx-auto">
              <Image
                src={withBasePath("/images/no-Invoice-svg.svg")}
                alt="No Invoice"
                height={200}
                width={200}
                className="w-full h-full object-contain"
              />
              <p className="text-center text-sm font-light md:text-xl">
                {!search && status === "all" && data?.invoice.length === 0
                  ? "You have not created any invoice yet. All created invoices would be displayed here."
                  : "No Invoice Found."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoices;
