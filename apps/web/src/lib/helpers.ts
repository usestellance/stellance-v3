import { SERVICE_CHARGE } from "@/lib/constants";
import { InvoiceItemsTypes } from "@/features/invoice/types";

// FORMAT CURRENCY
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export const formatCurrencyStructure = (value: number | string): string => {
  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;

  if (isNaN(num)) return "";

  return num.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function maskMiddle(
  text: string,
  visibleStart = 5,
  visibleEnd = 5
): string {
  if (text?.length <= visibleStart + visibleEnd) return text;

  const start = text?.slice(0, visibleStart);
  const end = text?.slice(-visibleEnd);
  // const masked = "*".repeat(text.length - (visibleStart + visibleEnd));
  const masked = "*".repeat(10);

  return `${start}${masked}${end}`;
}

// --------------------------
// Helper → Time Ago
// --------------------------
export const getTimeAgo = (timestamp: string) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffMs = now.getTime() - notificationTime.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  return notificationTime.toLocaleDateString();
};

export function formatWalletCurrency(
  amount: number | undefined,
  wallet: "$" | "xlm"
): string {
  if (amount === undefined || isNaN(amount)) {
    return wallet === "$" ? "$ 0.00" : "XLM 0.00";
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return wallet === "$" ? `$ ${formatted}` : `XLM ${formatted}`;
}


// Calculates subtotal (sum of all item amounts after individual discounts)
export function calculateTotal(items: InvoiceItemsTypes[]): number {
  return items.reduce((total, item) => {
    const itemTotal =
      item.quantity * item.unit_price * ((100 - item.discount) / 100);
    return total + itemTotal;
  }, 0);
}

export function calculateServiceFee(
  subtotal: number
    // feePercentage: number
): number {
  return (subtotal * SERVICE_CHARGE) / 100;
}

export function calculateNetTotal(
  subtotal: number,
  serviceFee: number
): number {
  return subtotal - serviceFee;
  // return subtotal;
}

export function numberToWordsUSD(amount: number): string {
  if (amount === 0) return "Zero Dollars Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const scales = ["", "Thousand", "Million", "Billion"];

  const convertHundreds = (num: number): string => {
    let result = "";

    if (num >= 100) {
      result += `${ones[Math.floor(num / 100)]} Hundred `;
      num %= 100;
    }

    if (num >= 20) {
      result += `${tens[Math.floor(num / 10)]} `;
      num %= 10;
    }

    if (num > 0) {
      result += `${ones[num]} `;
    }

    return result.trim();
  };

  const [integerPart, decimalPart] = amount.toFixed(2).split(".");
  let num = parseInt(integerPart, 10);

  let words = "";
  let scaleIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;

    if (chunk > 0) {
      words = `${convertHundreds(chunk)} ${scales[scaleIndex]} ${words}`;
    }

    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  let result = words.trim();

  const cents = parseInt(decimalPart, 10);

  if (cents > 0) {
    result += ` Dollars and ${convertHundreds(cents)} Cents Only`;
  } else {
    result += " Dollars Only";
  }

  return result.replace(/\s+/g, " ").trim();
}

export function formatDate(raw: string | Date | null | undefined): string {
  if (!raw) return "-";
  const date = raw instanceof Date ? raw : new Date(raw);
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export const capitalizeWords = (text: string) => {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function getDueStatus(dueAt: string | Date | null | undefined) {
  if (!dueAt) return ""; // or "No due date"

  const due = new Date(dueAt);
  const today = new Date();

  // ❗ Check if date is invalid
  if (isNaN(due.getTime())) return "";

  // Normalize time
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const absDays = Math.abs(diffDays);
  const weeks = Math.floor(absDays / 7);
  const months = Math.floor(absDays / 30);

  const format = (value: number, unit: string) =>
    `${value} ${unit}${value > 1 ? "s" : ""}`;

  // ---- Future ----
  if (diffDays > 0) {
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays < 7) return `Due in ${format(diffDays, "day")}`;
    if (diffDays < 30) return `Due in ${format(weeks, "week")}`;
    return `Due in ${format(months, "month")}`;
  }

  // ---- Today ----
  if (diffDays === 0) return "Due today";

  // ---- Overdue ----
  if (absDays === 1) return "Overdue by 1 day";
  if (absDays < 7) return `Overdue by ${format(absDays, "day")}`;
  if (absDays < 30) return `Overdue by ${format(weeks, "week")}`;
  return `Overdue by ${format(months, "month")}`;
}


export const formatDateForInput = (date?: string) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

export const formatTimeAgo = (date: string) => {
  const now = new Date();
  const then = new Date(date);

  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function formatCentsToDollars(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}
