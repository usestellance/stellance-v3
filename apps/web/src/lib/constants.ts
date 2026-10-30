import { InvoiceStatus } from "@/features/invoice/store";

export const invoiceStatusOptions: { label: string; value: InvoiceStatus }[] = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  // { label: "Pending", value: "pending" },
  { label: "Sent", value: "sent" },
  { label: "Pending", value: "viewed" },
  { label: "Draft", value: "draft" },
  // The API replaced "overdue" with "expired" (2026-10-21) and added "invalid_payment".
  { label: "Invalid payment", value: "invalid_payment" },
  { label: "Expired", value: "expired" },
  { label: "Cancelled", value: "cancelled" },
];

/** Stellance service fee, in percent of the subtotal. The merchant pays it; the client never sees it. */
export const SERVICE_CHARGE = 1;

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
