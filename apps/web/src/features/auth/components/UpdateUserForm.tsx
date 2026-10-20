"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@repo/ui/form";

import { Button } from "@repo/ui/button";
import InputField from "@repo/ui/input-field";
import { useToast } from "@/lib/use-toast";
import { UpdateUserSchema } from "@/features/auth/schema";
import { Combobox } from "@repo/ui/combobox";
import { countryCodes, CURRENCIES } from "@/lib/countries";
import { authRoutes } from "@/lib/routes";
import ChangePasswordDialog from "@/features/auth/components/ChangePasswordDialog";
import { maskMiddle } from "@/lib/helpers";
import { useUpdateProfile } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/store";

type SetUpAccountValues = z.infer<typeof UpdateUserSchema>;

const countryOptions = countryCodes.map((country) => ({
  value: country.country.toLowerCase(),
  label: country.country,
  code: country.code,
  abb: country.abb,
}));
const currencyOptions = CURRENCIES.map((currency) => ({
  value: currency.code,
  label: currency.name,
  code: currency.code,
  name: currency.name,
  symbol: currency.symbol,
  subunit: currency.subunit, // kobo
}));

export default function UpdateUserForm() {
  const { mutate, isPending } = useUpdateProfile();
  const credentials = useAuthStore((state) => state.credentials);
  const user = credentials?.user?.profile;
  const wallet = credentials?.user?.wallet;

  const form = useForm<SetUpAccountValues>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      business_name: "",
      phone_number: "",
      country: "",
      wallet_address: "",
      currency: "",
    },
  });

  const onSubmit = (values: SetUpAccountValues) => {
    const {
      business_name,
      country,
      first_name,
      last_name,
      phone_number,
      currency,
    } = values;
    mutate({
      business_name,
      country,
      first_name,
      last_name,
      phone_number,
      currency,
    });
  };

  useEffect(() => {
    if (user || wallet) {
      form.reset({
        email: user?.email || "",
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        business_name: user?.business_name || "",
        phone_number: user?.phone_number || "",
        country: user?.country?.toLowerCase() ?? "",
        wallet_address: maskMiddle(wallet?.address?.trim() || ""),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wallet]);

  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 lg:space-y-7"
        >
          <div className="flex gap-5">
            {/* --------------------------------
              FIRST NAME FIELD
          -------------------------------- */}

            <FormField
              control={form.control}
              name="first_name"
              render={({ field, fieldState }) => (
                <FormItem className="w-full">
                  <FormLabel>First Name</FormLabel>

                  <FormControl>
                    <InputField
                      {...field}
                      label=""
                      placeholder="John"
                      type="text"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --------------------------------
              LAST NAME FIELD
          -------------------------------- */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field, fieldState }) => (
                <FormItem className="w-full">
                  <FormLabel>Last Name</FormLabel>

                  <FormControl>
                    <InputField
                      {...field}
                      label=""
                      placeholder="Doe"
                      type="text"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-5 lg:grid lg:grid-cols-2 gap-x-5">
            {/* --------------------------------
              BUSINESS NAME FIELD
          -------------------------------- */}
            <FormField
              control={form.control}
              name="business_name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>

                  <FormControl>
                    <InputField
                      {...field}
                      value={field.value ?? ""}
                      label=""
                      placeholder="Stellance"
                      type="text"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            {/* --------------------------------
              Phone NUMBER FIELD
          -------------------------------- */}
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>

                  <FormControl>
                    <InputField
                      {...field}
                      value={field.value ?? ""}
                      label=""
                      placeholder="+xxx xxx xxxx"
                      type="text"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            {/* --------------------------------
              COUNTRY FIELD
          -------------------------------- */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>

                  <FormControl>
                    <Combobox
                      className="mt-2"
                      options={countryOptions}
                      value={field.value}
                      onChange={(val) => field.onChange(val)} // val is full object
                      placeholder="Select country..."
                      renderOption={(option) => (
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-8">
                            {option.abb}
                          </span>
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.code}
                          </span>
                        </span>
                      )}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --------------------------------
              Email FIELD
          -------------------------------- */}
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <InputField
                      {...field}
                      value={field.value ?? ""}
                      label=""
                      disabled
                      className=""
                      placeholder=""
                      type="email"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --------------------------------
              Currency FIELD
          -------------------------------- */}
            {/* <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>

                  <FormControl>
                    <Combobox
                      className="mt-2"
                      options={currencyOptions}
                      value={field.value}
                      onChange={(val) => field.onChange(val)} // val is full object
                      placeholder="Select currency..."
                      renderOption={(option) => (
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-8">
                            {option.symbol}
                          </span>
                          <span>{option.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.code}
                          </span>
                        </span>
                      )}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* --------------------------------
              Wallet address FIELD
          -------------------------------- */}
            <FormField
              control={form.control}
              name="wallet_address"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="-mt2">
                    Stellar Wallet Address
                  </FormLabel>

                  <FormControl>
                    <InputField
                      {...field}
                      value={field.value ?? ""}
                      label=""
                      disabled
                      placeholder=""
                      className="-mt6"
                      type="text"
                      error={fieldState.error?.message ?? null}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-center flex-col items-center gap-7 mt-10 md:mt-[60px]">
            <ChangePasswordDialog />
            {/* <div className="text-error-500 lg:text-xl cursor-pointer">
              Change Password
            </div> */}
            <Button
              type="submit"
              isLoading={isPending}
              className="w-full max-w-[500px] mx-auto"
            >
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
