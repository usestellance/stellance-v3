import { InvoiceStatus } from "@/features/invoice/store";

export const invoiceStatusOptions: { label: string; value: InvoiceStatus }[] = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  // { label: "Pending", value: "pending" },
  { label: "Sent", value: "sent" },
  { label: "Pending", value: "viewed" },
  { label: "Draft", value: "draft" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
];

export const SERVICE_CHARGE = 10;

export const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
