"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
// import { useRouter } from "next/navigation";
import { SetUpAccountSchema } from "@/features/auth/schema";
import { Combobox } from "@repo/ui/combobox";
import { countryCodes } from "@/lib/countries";
import { useCompleteProfile } from "@/features/auth/hooks";

type SetUpAccountValues = z.infer<typeof SetUpAccountSchema>;

const countryOptions = countryCodes.map((country) => ({
  value: country.country,
  label: country.country,
  code: country.code,
  abb: country.abb,
}));

export default function SetUpAccountForm() {
  const { mutate, isPending } = useCompleteProfile();

  const form = useForm<SetUpAccountValues>({
    resolver: zodResolver(SetUpAccountSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      business_name: "",
      phone_number: "",
      country: "Nigeria",
    },
  });

  const onSubmit = (values: SetUpAccountValues) => {
    const { business_name, country, first_name, last_name, phone_number } =
      values;
    mutate({ business_name, country, first_name, last_name, phone_number });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* --------------------------------
              FIRST NAME FIELD
          -------------------------------- */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>First Name*</FormLabel>

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
              <FormItem>
                <FormLabel>Last Name*</FormLabel>

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
                <FormLabel>Country*</FormLabel>

                <FormControl>
                  <Combobox
                    options={countryOptions}
                    value={field.value}
                    onChange={field.onChange}
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

          <Button type="submit" isLoading={isPending} className="w-full mt-2">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
