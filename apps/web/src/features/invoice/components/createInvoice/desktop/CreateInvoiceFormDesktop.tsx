"use client";
/* eslint-disable @next/next/no-img-element -- merchant logos are blob, data or remote URLs that next/image cannot optimise */

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoUpload } from "react-icons/go";
import {
  InvoiceFormValues,
  invoiceSchema,
} from "@/features/invoice/schema";
import { SERVICE_CHARGE } from "@/lib/constants";
import {
  calculateLineAmount,
  calculateTotal,
  formatCurrency,
  formatDateForInput,
  invoiceBreakdown,
} from "@/lib/helpers";
import { ServiceFeeBreakdown } from "@/features/invoice/components/ServiceFeeBreakdown";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { useFieldArray } from "react-hook-form";
import InputField from "@repo/ui/input-field";
import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";
// import { invoiceItems } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/use-toast";
import { InvoiceType } from "@/features/invoice/types";
import { FiTrash } from "react-icons/fi";
import SelectField from "@repo/ui/select-field";
import { useCreateInvoice, useUpdateInvoice } from "@/features/invoice/hooks";
import { Label } from "@repo/ui/label";
import { Checkbox } from "@repo/ui/checkbox";
import { PaymentRequirements } from "@/features/payments/components/PaymentRequirements";

export default function CreateInvoiceFormDesktop({
  invoice,
  edit,
}: {
  invoice?: InvoiceType;
  edit?: boolean;
}) {
  const toast = useToast();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice({ invoiceId: invoice?.id || "" });
  const [make_default, setMake_default] = useState(true);
  // The logo preview lives here, not inside the field's render callback (hooks can't run in callbacks).
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  const isEdit = invoice?.id && edit;

  // console.log(isEdit);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      logo: undefined,
      title:  "",
      clientName:  "",
      email:  "",
      address:  "",
      dueDate:  "",
      notes:  "",
      items:  [],
      subtotal:  0,
      charge: SERVICE_CHARGE,
      // discount: 0,
      total:  0,
    },
  });
  const {
    fields: items,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function onSubmit(values: InvoiceFormValues) {
    // console.log("Items from Zustand:", items);
    // console.log("Items length:", items.length);
    // console.log("Form values:", values);
    if (watchedItems.length === 0) {
      toast.error("Please add at least one invoice item");
      return;
    }

    const stored = localStorage.getItem("invoice-template");
    const template_id = invoice?.template_id
      ? invoice?.template_id
      : stored
        ? JSON.parse(stored).state.selectedTemplate
        : "template_001";

    const payload = {
      title: values.title,
      payer_name: values.clientName,
      payer_email: values.email,
      country: values.address,
      due_date: values.dueDate,
      invoice_items: values.items,
      // The API adds service_fee to what the client pays; the merchant carries the fee, so nothing is added.
      service_fee: 0,
      template_id,
      logo: values.logo,
      make_default,
      note: values.notes,
    };

    // Items are cleared only once the API has the invoice, so a failed save keeps what was typed.
    if (isEdit) {
      updateInvoice.mutate(payload, { onSuccess: clearItems });
    } else {
      createInvoice.mutate(payload, { onSuccess: clearItems });
    }
  }

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    watchedItems?.forEach((item, index) => {
      const amount = calculateLineAmount(item);

      if (amount !== item.amount) {
        form.setValue(`items.${index}.amount`, amount, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    });
  }, [watchedItems, form]);

  const breakdown = invoiceBreakdown(calculateTotal(watchedItems ?? []));

  const clientTotal = formatCurrency(breakdown.clientPays);

  const clearItems = () => {
    form.setValue("items", []);
  };

  useEffect(() => {
    if (isEdit && invoice) {
      form.reset({
        // logo: undefined,
        title: invoice.title ?? "",
        clientName: invoice.payer_name ?? "",
        email: invoice.payer_email ?? "",
        address: invoice.country ?? "",
        dueDate: formatDateForInput(invoice.due_date ?? ""),
        notes: invoice.note ?? "",
        items: (invoice?.items as InvoiceFormValues["items"]) ?? [],
        subtotal: invoice.sub_total ?? 0,
        charge: SERVICE_CHARGE,
        total: invoice.total ?? 0,
      });
    }
  }, [isEdit, invoice, form]);

  return (
    <div className="max-w-300 mx-auto">
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit, (e) => {
            console.log("FORM ERRORS:", e);
            if (watchedItems.length === 0) {
              toast.error("Please add at least one invoice item");
            }
          })}
          className="space-y-5"
        >
          {/* HEADER */}
          <div className="flex justify-between gap-5 custom-container">
            <h2 className="text-lg sm:text-2xl lg:text-[36px]">
              Add your details to generate invoice
            </h2>

            {/* LOGO UPLOAD */}
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => {

                return (
                  <FormItem className="flex flex-col items-end ">
                    <FormControl>
                      <div>
                        <input
                          type="file"
                          className="hidden"
                          id="logo-upload"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            field.onChange(file);
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />

                        <label
                          htmlFor="logo-upload"
                          className={`inline-flex flex-col items-center justify-center rounded-[5px] cursor-pointer gap-1 min-h-20 h-20 max-h-20 min-w-20 max-w-20 border-2 border-dashed border-primary-50 sm:min-w-40 sm:min-h-40 sm:h-40 sm:max-w-40 sm:max-h-40 ${
                            preview ? "bg-transparent" : "bg-primary-20"
                          }`}
                        >
                          {isEdit && !preview && invoice?.logo_url ? (
                            <img
                              src={invoice?.logo_url}
                              alt="logo"
                              className="w-full h-full object-contain"
                            />
                          ) : preview ? (
                            <img
                              src={preview}
                              alt="logo"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <>
                              <GoUpload className="text-xl sm:text-3xl" />
                              <span className="text-[10px] sm:text-base text-center">
                                Upload <br /> logo
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />

                    <div className="flex items-center gap-2 w-full justify-center">
                      <Checkbox
                        id="make_default"
                        checked={make_default}
                        onCheckedChange={(checked) => {
                          setMake_default(checked === true);
                        }}
                        className="data-[state=checked]:text-primary-500 data-[state=checked]:bg-white size-4 data-[state=checked]:border-primary-100"
                      />

                      <Label
                        htmlFor="make_default"
                        className="whitespace-nowrap"
                      >
                        Set as default
                      </Label>
                    </div>
                  </FormItem>
                );
              }}
            />
          </div>

          {/* CLIENT DETAILS */}
          <div className="space-y-8 custom-container">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field, fieldState }) => {
                // console.log("FIELD STATE:", fieldState, field);
                return (
                  <FormItem>
                    <FormLabel>Bill To</FormLabel>
                    <FormControl>
                      <InputField
                        {...field}
                        className="max-w-1/2"
                        placeholder="Recipient Name"
                        error={fieldState.error?.message ?? null}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputField
                      {...field}
                      className="max-w-1/2"
                      type="email"
                      placeholder="Recipient Email"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <InputField
                      {...field}
                      className="max-w-1/2"
                      type="text"
                      placeholder="Invoice Title"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <InputField
                      {...field}
                      className="max-w-1/2"
                      placeholder="Recipient Country / Address"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ITEMS */}
          <div className="custom-container">
            <h3 className="mt-20 text-[22px]">Invoice Items</h3>

            <div className="flex flex-col gap-4 xl:gap-8 divide-y mb-8 divide-primary-600">
              {items.map((item, index) => (
                <div key={item.id} className="pb-16 mt-8">
                  {/* <div className="flex flex-col gap-6"> */}
                  <div className="flex gap-8 justify-between items-center">
                    <div className="flex-1 mt-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.invoice_type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="">Invoice Type</FormLabel>
                            <FormControl>
                              <SelectField
                                className="w-full mt-2"
                                // name="invoice_type"
                                {...field}
                                options={[
                                  { label: "Per Unit", value: "per_unit" },
                                  { label: "Per Hour", value: "per_hour" },
                                ]}
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      {/* DESCRIPTION */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field, fieldState }) => (
                          <InputField
                            {...field}
                            label="Description"
                            placeholder="Brief description"
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                      <FormMessage />
                    </div>
                  </div>

                  <div className="flex mt-4 justify-between gap-4 xl:gap-8">
                    {/* QUANTITY */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <InputField
                            {...field}
                            type="number"
                            label="Quantity"
                            min={1}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        )}
                      />

                      <FormMessage />
                    </div>

                    {/* UNIT PRICE */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unit_price`}
                        render={({ field }) => (
                          <InputField
                            {...field}
                            type="number"
                            label="Unit Price"
                            min={0}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        )}
                      />
                    </div>

                    {/* DISCOUNT */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <InputField
                            {...field}
                            type="number"
                            label="Discount (%)"
                            min={0}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        )}
                      />
                    </div>

                    {/* AMOUNT (READONLY) */}
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <InputField
                            {...field}
                            type="string"
                            label="Amount"
                            value={formatCurrency(field.value)}
                            readonly
                          />
                        )}
                      />
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center gap-2 text-error-400 mt-5"
                    >
                      <FiTrash /> Remove Item
                    </button>
                  )}
                </div>
                // </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={() =>
                append({
                  invoice_type: "per_hour",
                  description: "",
                  quantity: 1,
                  unit_price: 0,
                  discount: 0,
                  amount: 0,
                })
              }
              className="bg-primary-50 text-black-500 hover:text-white font-medium text-lg w-51.75 h-15.5"
            >
              Add New Item
            </Button>
          </div>

          <hr className="border-neutral-600 mt-15" />

          {/* TOTAL: what the client sees and pays */}
          <div className="custom-container">
            <div className="place-self-end w-1/2 my-10 border rounded-[10px] overflow-hidden border-primary-500 text-xl flex justify-between items-center">
              <span className="bg-primary-500 px-9.5 py-3.75 font-bold text-neutral-500">
                Total
              </span>
              <span className="font-bold px-3.75 py-2.75 line-clamp-1">
                {clientTotal}
              </span>
            </div>

            {/* Merchant only: the fee and what is left after it */}
            <ServiceFeeBreakdown breakdown={breakdown} className="place-self-end lg:w-1/2" />
          </div>

          {/* DUE DATE + NOTES */}
          <div className="space-y-8 custom-container">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <InputField {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add additional note of max 150 characters"
                      maxLength={150}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <PaymentRequirements total={clientTotal} invoiceId={invoice?.id} />

          <div className="flex max-w-full gap-7.5  justify-center mt-10 lg:mt-15">
            <Button
              onClick={() => router.back()}
              className="in-app-btn"
              variant="outline"
            >
             Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createInvoice.isPending || updateInvoice.isPending}
              className="in-app-btn"
            >
              Proceed
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
