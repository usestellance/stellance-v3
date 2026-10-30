"use client";

import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInvoiceItems } from "@/features/invoice/store";
import { calculateLineAmount } from "@/lib/helpers";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/drawer";
import type { Resolver } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import InputField from "@repo/ui/input-field";
import { Button } from "@repo/ui/button";
import { useEffect } from "react";
import SelectField from "@repo/ui/select-field";
import { itemSchema } from "@/features/invoice/schema";
import { useToast } from "@/lib/use-toast";

type ItemValues = z.infer<typeof itemSchema>;

export default function AddInvoiceItemDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const {
    addItem,
    updateItem,
    editingIndex,
    items,
    setEditingIndex,
    setOpenDrawer,
  } = useInvoiceItems();

  const toast = useToast();

  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema) as Resolver<ItemValues>,
    defaultValues: {
      description: "",
      quantity: 0,
      unit_price: 0,
      discount: 0,
      invoice_type: "per_unit",
      amount: 0,
    },
  });

  useEffect(() => {
    if (editingIndex !== null && items[editingIndex]) {
      form.reset(items[editingIndex] as ItemValues);
    }
  }, [editingIndex, items, form]);

  const [quantity, unit_price, discount] = useWatch({ control: form.control, name: ["quantity", "unit_price", "discount"] });
  useEffect(() => {
    const discounted = unit_price * quantity * (1 - discount / 100);
    form.setValue("amount", parseFloat(discounted.toFixed(2)));
  }, [quantity, unit_price, discount, form]);

  const onSubmit = (values: ItemValues) => {
    const amount = calculateLineAmount(values);

    const payload = { ...values, amount };

    if (editingIndex !== null) {
      updateItem(payload); // Update the item
      toast.success("Item updated");
    } else {
      addItem(payload); // Add new item
      toast.success("Item added");
    }

    setEditingIndex(null);
    onOpenChange(false);
    form.reset({
      description: "",
      quantity: 0,
      unit_price: 0,
      discount: 0,
      invoice_type: "per_unit",
      amount: 0,
    });
  };

  const Content = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4 overflow-y-auto"
      >
        <FormField
          control={form.control}
          name="invoice_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Type</FormLabel>
              <FormControl>
                <SelectField
                  className="w-full mt-2"
                  name="invoice_type"
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

        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>

              <FormControl>
                <InputField
                  {...field}
                  label=""
                  placeholder="Job Description"
                  type="text"
                  error={fieldState.error?.message ?? null}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <InputField
                  {...field}
                  type="number"
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  error={fieldState.error?.message}
                />
                {/* <InputField
                  {...field}
                  type="number"
                  min={1}
                  value={Number(field.value)}
                  /> */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit_price"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Unit Price</FormLabel>
              <FormControl>
                <InputField
                  {...field}
                  type="number"
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  error={fieldState.error?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discount"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Discount (%)</FormLabel>
              <FormControl>
                <InputField
                  {...field}
                  type="number"
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  error={fieldState.error?.message}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <InputField
                  {...field}
                  type="number"
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  error={fieldState.error?.message}
                  readonly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex max-w-full gap-[30px]  justify-center mt-10 lg:mt-[60px] mb-10">
          <Button
            onClick={() => setOpenDrawer(false)}
            className="in-app-btn"
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit" className="in-app-btn">
            Add Item
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="">
        <DrawerHeader>
          <DrawerTitle className="text-base">Add Item</DrawerTitle>
        </DrawerHeader>
        {Content}
      </DrawerContent>
    </Drawer>
  );
}
