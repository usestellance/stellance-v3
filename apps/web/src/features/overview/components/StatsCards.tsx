import React from "react";
import { AnimatedNumber } from "@repo/ui/animated-number";
import { useGetTransactionStats } from "@/features/overview/hooks";
import { formatCentsToDollars } from "@/lib/helpers";

const Card = ({
  title,
  amount,
  count,
  index,
}: {
  title: string;
  /** In cents, as the API returns it. */
  amount: number;
  count: number;
  index: number;
}) => {
  return (
    <div
      className="animate-rise h-[110px] sm:h-[140px] w-full border-[0.5px] border-primary-500/15 bg-neutral-500 rounded-[5px] shadow-lg shadow-[#8392cd]/30 px-2.5 py-3 flex flex-col gap-2.5 sm:justify-between sm:py-5 sm:rounded-[10px] sm:px-3 hover:-translate-y-1 duration-150"
      style={{ "--i": index } as React.CSSProperties}
    >
      <h6 className="text-[10px] sm:text-sm">{title.toUpperCase()}</h6>
      <p className="tracking-wider fontmedium text-xl sm:text-[26px] text-primary-500 line-clamp-1">
        <AnimatedNumber value={amount} format={formatCentsToDollars} />
      </p>
      <div className="rounded-[20px] bg-primary-50 text-[10px] sm:text-xs font-medium w-fit py-0.5 px-3 ">
        <AnimatedNumber value={count} /> invoice{count === 1 ? "" : "s"}
      </div>
    </div>
  );
};

export const StatsCards = () => {
  const { data } = useGetTransactionStats();

  return (
    <div className="custom-container grid grid-cols-2 gap-y-5 gap-x-2.5 lg:grid-cols-4 xl:gap-6">
      <Card
        index={0}
        title="Total"
        amount={data?.total_amount?.amount || 0}
        count={data?.total_amount?.invoice_count || 0}
      />
      <Card
        index={1}
        title="Paid"
        amount={data?.paid_amount?.amount || 0}
        count={data?.paid_amount?.invoice_count || 0}
      />
      <Card
        index={2}
        title="Pending"
        amount={data?.pending_amount?.amount || 0}
        count={data?.pending_amount?.invoice_count || 0}
      />
      <Card
        index={3}
        // Unpaid invoices past their payment window are `expired`; the API no longer produces `overdue`.
        title="Expired"
        amount={data?.expired_amount?.amount || 0}
        count={data?.expired_amount?.invoice_count || 0}
      />
    </div>
  );
};
