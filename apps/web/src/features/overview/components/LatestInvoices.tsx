import React from "react";
import InvoiceCard from "@/components/MobileInvoiceList";
import { InvoiceType } from "@/features/invoice/types";
import { DataTable } from "@/components/DesktopInvoiceList/data-table";
import { columns } from "@/components/DesktopInvoiceList/columns";
// import { invoiceItems } from "@/lib/utils";
import { useGetInvoices } from "@/features/invoice/hooks";

// export const mockInvoices: InvoiceType[] = [
//   {
//     template_id: "template_001",
//     logo: "template_001",
//     id: "inv_001",
//     invoice_number: "INV-001",
//     payer_name: "Janet John",
//     payer_email: "janet@example.com",
//     description: "Web Development Services - Q1 2025",
//     total: 1100,
//     status: "pending",
//     items: invoiceItems,
//     approved: false,
//     review_date: "2025-01-10T09:20:00Z",
//     created_at: "2025-01-05",
//     due_date: "2025-01-20",
//     currency: "USD",
//   },
//   {
//     template_id: "template_002",
//     logo: "template_002",
//     items: invoiceItems,
//     id: "inv_002",
//     invoice_number: "INV-002",
//     payer_name: "David Mark",
//     payer_email: "david@example.com",
//     description: "Logo Design and Branding",
//     total: 300,
//     status: "draft",
//     approved: false,
//     review_date: null,
//     created_at: "2025-02-01",
//     due_date: "2025-02-10",
//     currency: "USD",
//   },
//   {
//     template_id: "template_003",
//     logo: "template_003",
//     id: "inv_003",
//     invoice_number: "INV-003",
//     items: invoiceItems,
//     payer_name: "Sarah Lee",
//     payer_email: "sarah@example.com",
//     description: "Monthly SEO Consultation",
//     total: 750,
//     status: "sent",
//     approved: false,
//     review_date: null,
//     created_at: "2025-02-15",
//     due_date: "2025-02-25",
//     currency: "USD",
//   },
//   {
//     template_id: "template_004",
//     logo: "template_004",
//     id: "inv_004",
//     invoice_number: "INV-004",
//     items: invoiceItems,
//     payer_name: "Michael Brown",
//     payer_email: "michael@example.com",
//     description: "E-commerce Platform Development",
//     total: 1500,
//     status: "viewed",
//     approved: true,
//     review_date: "2025-03-02T10:45:00Z",
//     created_at: "2025-03-01",
//     due_date: "2025-03-15",
//     currency: "USD",
//   },
//   {
//     template_id: "template_005",
//     logo: "template_005",
//     id: "inv_005",
//     items: invoiceItems,
//     invoice_number: "INV-005",
//     payer_name: "Grace Peters",
//     payer_email: "grace@example.com",
//     description: "Social Media Management - February",
//     total: 600,
//     status: "paid",
//     approved: true,
//     review_date: "2025-03-05T13:15:00Z",
//     created_at: "2025-02-28",
//     due_date: "2025-03-10",
//     currency: "USD",
//   },
//   {
//     template_id: "template_002",
//     logo: "template_002",
//     id: "inv_006",
//     items: invoiceItems,
//     invoice_number: "INV-006",
//     payer_name: "Samuel King",
//     payer_email: "samuel@example.com",
//     description: "Content Writing Services",
//     total: 400,
//     status: "overdue",
//     approved: false,
//     review_date: "2025-03-20T08:00:00Z",
//     created_at: "2025-03-01",
//     due_date: "2025-03-05",
//     currency: "USD",
//   },
//   {
//     template_id: "template_005",
//     logo: "template_005",
//     id: "inv_007",
//     invoice_number: "INV-007",
//     payer_name: "Tina Morgan",
//     payer_email: "tina@example.com",
//     items: invoiceItems,
//     description: "UI/UX Design Project",
//     total: 950,
//     status: "cancelled",
//     approved: false,
//     review_date: "2025-04-10T15:30:00Z",
//     created_at: "2025-04-01",
//     due_date: "2025-04-12",
//     currency: "USD",
//   },
//   {
//     template_id: "template_003",
//     logo: "template_003",
//     id: "inv_008",
//     invoice_number: "INV-008",
//     payer_name: "Kelvin Watts",
//     payer_email: "kelvin@example.com",
//     description: "Mobile App Development - iOS & Android",
//     items: invoiceItems,
//     total: 2200,
//     status: "viewed",
//     approved: false,
//     review_date: "2025-04-20T12:00:00Z",
//     created_at: "2025-04-15",
//     due_date: "2025-05-01",
//     currency: "USD",
//   },
//   {
//     template_id: "template_004",
//     logo: "template_004",
//     id: "inv_009",
//     invoice_number: "INV-009",
//     payer_name: "Monica Stone",
//     payer_email: "monica@example.com",
//     description: "Database Optimization and Maintenance",
//     items: invoiceItems,
//     total: 1300,
//     status: "paid",
//     approved: true,
//     review_date: "2025-05-06T11:10:00Z",
//     created_at: "2025-05-01",
//     due_date: "2025-05-20",
//     currency: "USD",
//   },
//   {
//     template_id: "template_001",
//     logo: "template_001",
//     id: "inv_010",
//     invoice_number: "INV-010",
//     payer_name: "Peter West",
//     payer_email: "peter@example.com",
//     items: invoiceItems,
//     description: "API Integration Services",
//     total: 780,
//     status: "sent",
//     approved: false,
//     review_date: null,
//     created_at: "2025-05-10",
//     due_date: "2025-05-25",
//     currency: "USD",
//   },
// ];

const LatestInvoices = () => {
  const { data, isLoading, isError, error } = useGetInvoices({});

  // console.log("Latest Invoices Data:", data);

  if (isLoading) {
    return (
      <>
        <h4 className="font-medium text-sm sm:text-lg lg:text-2xl mb-2.5 md:mb-[30px]">
          Latest Invoices
        </h4>
        <div className="text-center mt-20">Loading latest invoices...</div>
      </>
    );
  }
  if (isError) {
    return (
      <>
        <h4 className="font-medium text-sm sm:text-lg lg:text-2xl mb-2.5 md:mb-[30px]">
          Latest Invoices
        </h4>
        <div className="text-center mt-20">Error loading latest invoices</div>
      </>
    );
  }

  return (
    <div>
      <h4 className="font-medium text-sm sm:text-lg lg:text-2xl mb-2.5 md:mb-[30px]">
        Latest Invoices
      </h4>

      {data?.invoice?.length > 0 ? (
        <div className="space-y-[15px] xl:hidden">
          {data.invoice?.map((inv: InvoiceType) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      ) : (
        <div className="mt-10 md:mt-20 pb-20 xl:hidden">
          <p className="font-light text-center leading-[25px] lg:text-2xl">
            You have not created any invoice yet. <br /> All latest invoices
            would be displayed here.
          </p>
        </div>
      )}

      <div className="max-xl:hidden overflow-x-auto">
        <DataTable data={data?.invoice || []} columns={columns} />
      </div>
    </div>
  );
};

export default LatestInvoices;
