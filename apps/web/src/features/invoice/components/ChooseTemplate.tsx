"use client";

import * as React from "react";
import { Card, CardContent } from "@repo/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@repo/ui/carousel";
import Image from "next/image";
import { invoiceTemplates } from "@/features/invoice/templates";
import { useTemplateStore } from "@/features/invoice/template-store";

const ChooseTemplate = () => {
  const { selectedTemplate, setTemplate } = useTemplateStore();

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="gap-4 lg:gap-[30px]">
        {invoiceTemplates.map((inv) => {
          const isSelected = selectedTemplate === inv.id;

          return (
            <CarouselItem
              key={inv.id}
              onClick={() => setTemplate(inv.id)}
              className="
                cursor-pointer
                w-full min-w-[100px] md:min-w-[110px] max-w-[180px]
                basis-1/4
                sm:basis-1/5
                md:basis-1/5
                lg:basis-1/6
              "
            >
              <div
                className={`w-full rounded-[5px] border transition-all duration-150 overflow-hidden ${
                  isSelected ? "border-primary" : "border-primary-20"
                }`}
              >
                <Card className="w-full min-h-40 rounded-[5px]">
                  <CardContent className="flex w-full h-40 sm:h-[200px] lg:h-[229px] xl:h-[260px] p-1 flex-col">
                    <Image
                      src={inv.thumbnail}
                      alt={inv.name}
                      width={500}
                      height={500}
                      className="h-full w-full object-contain"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-center mt-3 text-primary-500">
                <span
                  className={`inline-block text-[10px] text-center sm:text-xl p-[5px] rounded-[5px] duration-150 ${
                    isSelected && "bg-primary-20"
                  }`}
                >
                  {inv.name}
                </span>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
};

export default ChooseTemplate;
