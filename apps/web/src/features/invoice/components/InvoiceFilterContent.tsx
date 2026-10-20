"use client";

import InputField from "@repo/ui/input-field";
import { IoIosSearch } from "react-icons/io";
import {
  useInvoiceFilter,
  InvoiceStatus,
} from "@/features/invoice/store";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

import { invoiceStatusOptions } from "@/lib/constants";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/tabs";

const InvoiceFilterContent = () => {
  const { search, setSearchTerm, status, setStatus, setPage } =
    useInvoiceFilter();

  return (
    <div>
      {/* SEARCH FIELD */}
      <div className="relative">
        <InputField
          type="text"
          name="search"
          value={search}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="border-0 bg-primary-20 lg:h-12 placeholder:text-neutral-900 placeholder:font-normal pl-7 lg:pl-9 placeholder:text-xs lg:placeholder:text-base"
          placeholder="Search by payer name or  invoice number..."
        />
        <IoIosSearch className="absolute text-neutral-900 max-lg:-translate-y-7 lg:top-[40%] left-2 lg:left-3 text-base lg:text-xl" />
      </div>

      {/* STATUS SELECT */}
      <div className="mt-5 xl:hidden">
        <Select
          value={status}
          onValueChange={(val: InvoiceStatus) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-[30px] rounded-[6px] min-w-[100px] md:min-w-[200px] max-w-[150px] shadow-none border-neutral-800 text-xs font-medium bg-white px-2.5 md:text-base">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="min-w-[100px] md:min-w-[200px]">
            {invoiceStatusOptions.map((opt) => (
              <SelectItem
                className="data-[state=checked]:bg-primary-50 data-[state=checked]:text-primary font-meduim md:text-base"
                key={opt.value}
                value={opt.value}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for desktop */}
      <div className="max-xl:hidden mt-[30px]">
        <Tabs value={status} className="w-full h-[54px]">
          <TabsList className="w-full h-full bg-primary-20">
            {invoiceStatusOptions.map((opt, i) => (
              <TabsTrigger
                key={i}
                onClick={() => {
                  setStatus(opt.value);
                  setPage(1);
                }}
                value={opt.value}
                className="text-[20px] data-[state=active]:bg-primary-50   rounded-[10px] cursor-pointer"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="account">
            Make changes to your account here.
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InvoiceFilterContent;
