import { ColumnDef } from "@tanstack/react-table";
import { InvoiceType } from "@/features/invoice/types";
import { StatusBadge, StatusType } from "@/components/InvoiceStatusBadge";
import { formatCurrency } from "@/lib/helpers";
import { InvoicePaymentStatus } from "@/features/payments/components/InvoicePaymentStatus";

export const columns: ColumnDef<InvoiceType>[] = [
  {
    accessorKey: "invoice_number",
    header: "Invoice ID",
  },
  {
    id: "customer_details",
    header: "Customer Details",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.payer_name}</span>
          <span className="text-sm text-neutral-900">
            {row.original.payer_email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "created_at",
    header: "Date Issued",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("due_date"));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const currency = formatCurrency(amount);

      return <span>{currency} <span className="text-xs text-neutral-900">USDC</span></span>;
      // const currency = row.original.currency;
      // return new Intl.NumberFormat("en-US", {
      //   style: "currency",
      //   currency: currency,
      // }).format(amount);
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as StatusType;
      return <StatusBadge status={status} variant="outlined" role="freelancer" />;
    },
  },
  {
    id: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => <InvoicePaymentStatus invoice={row.original} />,
  },
];
