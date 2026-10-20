"use client";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { invoiceRoutes } from "@/lib/routes";
import { StatsCards } from "@/features/overview/components/StatsCards";
import { ChartAreaInteractive } from "@/features/overview/components/AreaChart";
import { ChartPieInteractive } from "@/features/overview/components/PieChart";
import LatestInvoices from "@/features/overview/components/LatestInvoices";
import { useAuthStore } from "@/features/auth/store";
import { PaymentsAttention } from "@/features/payments/components/PaymentsAttention";

export default function Page() {
  const router = useRouter();
  const credentials = useAuthStore((state) => state.credentials);
  // console.log(credentials);

  return (
    <div className="pb-20 ">
      <section className="bg-primary-500">
        <div className="custom-container text-neutral-comment flex justify-between items-center py-6 max-lg:mt-8 gap-2">
          <div className="animate-rise flex flex-col gap-1">
            <p className="sm:text-2xl lg:text-3xl line-clamp-1">
              Good day, {credentials?.user?.profile?.first_name || ""}
            </p>
            <p className="text-sm font-light sm:text-base">
              Let&apos;s manage your invoices
            </p>
          </div>
          <div>
            <Button
              onClick={() => router.push(invoiceRoutes.CHOOSE_TEMPLATE)}
              className="lg:min-w-[200px]"
              variant="secondary"
            >
              Create Invoice
            </Button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-primary-50/40 mt-10 py-5">
        <StatsCards />
        <PaymentsAttention />
      </section>

      <section className="max-w-[2000px] mx-auto sm:px-[30px] md:px-10 flex flex-col mt-10 lg:flex-row gap-[42px]">
        <div className="border-2 lg:border-[5px] border-primary-20 lg:rounded-[10px] lg:w-1/2 overflow-hidden">
          <ChartAreaInteractive />
        </div>
        <div className="lg:w-1/2 border-2 lg:border-[5px] border-primary-20 lg:rounded-[10px] overflow-hidden">
          <ChartPieInteractive />
        </div>
      </section>

      <section className="mt-10 lg:mt-[60px]">
        <div className="custom-container">
          <LatestInvoices />
        </div>
      </section>
    </div>
  );
}
