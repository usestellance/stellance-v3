"use client";
import Image from "next/image";
import { invoiceTemplates } from "@/features/invoice/templates";
import ChooseTemplate from "@/features/invoice/components/ChooseTemplate";
import { useTemplateStore } from "@/features/invoice/template-store";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { invoiceRoutes } from "@/lib/routes";

export default function Page() {
  const { selectedTemplate } = useTemplateStore();
  const temp = invoiceTemplates.find((t) => t.id === selectedTemplate);
  const router = useRouter();

  const proceed = (p: boolean) => {
    if (p) {
      router.push(invoiceRoutes.CREATE);
    } else {
      router.push(invoiceRoutes.INVOICES);
    }
  };

  return (
    <div className="pb-20 ">
      <section className="bg-primary-500">
        <div className="custom-container text-neutral-comment  flex py-6 max-lg:mt-8 flex-col gap-1 md:gap-2.5">
          <p className="text-xl sm:text-3xl md:text-4xl">Create Invoice</p>
          <p className="text-sm font-light sm:text-xl md:text-2xl">
            Let&apos;s manage your invoices
          </p>
        </div>
      </section>

      <section className="mt-10">
        <div className="w-full lg:max-w-fit mx-auto pl-4 sm:pl-[30px] md:pl-10 bg-pink-40">
          <ChooseTemplate />
        </div>
      </section>

      <section className="mt-8 md:mt-20 ">
        <div className="custom-container overflow-x-auto">
          <h3 className="lg:text-2xl font-light italic xl:text-center">
            Preview Template
          </h3>
          {temp && (
            <>
              <div className="w-full max-w-[955px] min-[770px]:max-w-[500px] lg:max-w-[995px] mx-auto">
                <Image
                  src={temp.thumbnail}
                  alt={temp.name}
                  width={500}
                  height={500}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex max-w-full gap-[30px]  justify-center mt-[23px] lg:mt-10">
                <Button onClick={() => proceed(true)} className="in-app-btn">
                  Use Invoice
                </Button>
                <Button
                  onClick={() => proceed(false)}
                  className="in-app-btn"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
