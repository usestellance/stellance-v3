import React from "react";
import clsx from "clsx";

export type StatusType =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "viewed"
  | "cancelled"
  | "pending";

type UserRole = "freelancer" | "client";

interface StatusBadgeProps {
  status: StatusType;
  role?: UserRole;
  variant?: "filled" | "outlined";
  className?: string;
}

const statusStyles: Record<
  "filled" | "outlined",
  Record<StatusType, string>
> = {
  filled: {
    draft: "bg-info-300",
    sent: "bg-info-500",
    paid: "bg-success-500",
    cancelled: "bg-error-400",
    viewed: "bg-primary-600",
    overdue: "bg-error-300",
    pending: "bg-warning-500",
  },
  outlined: {
    draft: "border border-info-300 text-info-500",
    sent: "border border-info-500 text-info-500",
    paid: "border border-success-500 text-success-700",
    cancelled: "border border-error-400 text-error-500",
    viewed: "border border-primary-600 text-primary-600",
    overdue: "border border-error-400 text-error-300",
    pending: "border border-warning-500 text-warning-600",
  },
};

/**
 * Only changes what is DISPLAYED
 * Does NOT mutate the real status
 */
const statusLabelMap: Record<
  UserRole,
  Partial<Record<StatusType, StatusType>>
> = {
  freelancer: {
    viewed: "pending",
  },
  client: {
    sent: "pending",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  role,
  variant = "filled",
  className,
}) => {
  const displayStatus = role
    ? (statusLabelMap[role][status] ?? status)
    : status;

  const baseStyles = `px-2.5 font-medium rounded-[5px] flex justify-center items-center ${
    variant === "filled"
      ? "min-w-[80px] w-fit h-10 text-sm text-neutral-comment"
      : "text-xs h-7 min-w-[60px] w-fit"
  }`;

  const style =
    variant === "filled"
      ? statusStyles.filled[displayStatus]
      : statusStyles.outlined[displayStatus];

  return (
    <span className={clsx(baseStyles, style, className)}>
      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
    </span>
  );
};

// import React from "react";
// import clsx from "clsx";

// export type StatusType =
//   | "draft"
//   | "sent"
//   | "paid"
//   | "overdue"
//   | "viewed"
//   | "cancelled"
//   | "pending";

// interface StatusBadgeProps {
//   status: StatusType;
//   variant?: "filled" | "outlined";
//   className?: string;
// }

// const statusStyles: Record<
//   "filled" | "outlined",
//   Record<StatusType, string>
// > = {
//   filled: {
//     draft: "bg-info-300",
//     sent: "bg-info-500",
//     paid: "bg-success-500",
//     cancelled: "bg-error-400",
//     viewed: "bg-accent-600",
//     overdue: "bg-error-300",
//     pending: "bg-warning-500",
//   },
//   outlined: {
//     draft: "border border-info-300 text-info-500",
//     sent: "border border-info-500 text-info-500",
//     paid: "border border-success-500 text-success-700",
//     cancelled: "border border-error-400 text-error-500",
//     viewed: "border border-primary-600 text-primary-600",
//     overdue: "border border-error-400 text-error-300",
//     pending: "border border-warning-500 text-warning-600",
//   },
// };

// export const StatusBadge: React.FC<StatusBadgeProps> = ({
//   status,
//   variant = "filled",
//   className,
// }) => {
//   const baseStyles = `px-2.5 font-medium rounded-[5px] flex justify-center items-center  font-medium ${
//     variant === "filled"
//       ? "min-w-[80px] w-fit h-10 text-sm text-neutral-comment"
//       : "text-xs h-7 min-w-[60px] w-fit"
//   } `;

//   const style =
//     variant === "filled"
//       ? statusStyles.filled[status]
//       : statusStyles.outlined[status];

//   return (
//     <span className={clsx(baseStyles, style, className)}>
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );
// };
