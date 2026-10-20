"use client";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import Invoices from "@/features/invoice/components/Invoices";
import { invoiceRoutes } from "@/lib/routes";

export default function Page() {
  const router = useRouter();
  return (
    <div className="pt-5 pb-20">
      <div className="custom-container">
        <section className="py-[15px] flex justify-between gap-2 items-center">
          <h2 className="h2-app">Invoice</h2>
          <Button
            onClick={() => router.push(invoiceRoutes.CHOOSE_TEMPLATE)}
            variant="default"
            className="in-app-btn"
          >
            Create Invoice
          </Button>
        </section>

        <section className="lg:mt-[30px]">
          <Invoices />
        </section>
      </div>
    </div>
  );
}
