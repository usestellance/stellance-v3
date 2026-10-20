"use client";

import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";

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
import { authRoutes, backendRoutes } from "@/lib/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/lib/use-toast";
import { ResetPasswordSchema } from "@/features/auth/schema";
import { getPasswordStrength } from "@/lib/utils";
import { axiosInstance } from "@/lib/api/client";
import axios from "axios";

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const toast = useToast();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        backendRoutes.AUTH_ROUTES.RESET_PASSWORD,
        {
          email,
          password: values.password,
          confirm_password: values.confirmPassword,
          otp: values.otp,
        },
      );

      if (res.data) {
        setLoading(false);
        toast.success(res?.data?.message);
        router.push(authRoutes.LOGIN);
      }
      // console.log(res);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      toast.error(errorMessage);
      //   console.log(error?.response?.data);
    }
  };

  // Watch password value from RHF
  const passwordValue = useWatch({
    control: form.control,
    name: "password",
  });

  // Calculate strength using useMemo
  const strength = useMemo(() => {
    return getPasswordStrength(passwordValue ?? "");
  }, [passwordValue]);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* --------------------------------
              PASSWORD FIELD
          -------------------------------- */}
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>

                <FormControl>
                  <div>
                    <InputField
                      {...field}
                      label=""
                      placeholder="Enter your password"
                      type="password"
                      error={fieldState.error?.message ?? null}
                    />

                    {/* PASSWORD STRENGTH METER */}
                    {passwordValue && passwordValue.length > 0 && (
                      <div className="mt-2">
                        <div className="w-full h-2 bg-[#cccccc] rounded-[6px] overflow-hidden">
                          <div
                            className={`h-full ${strength.color}`}
                            style={{
                              width: `${(strength.score / 4) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1 text-xs font-medium">
                          {strength.label}
                        </p>
                      </div>
                    )}
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* --------------------------------
              CONFIRM PASSWORD FIELD
          -------------------------------- */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Re-enter Password</FormLabel>

                <FormControl>
                  <InputField
                    {...field}
                    label=""
                    placeholder="Confirm your password"
                    type="password"
                    error={fieldState.error?.message ?? null}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* --------------------------------
              OTP FIELD
          -------------------------------- */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>One Time Password (OTP)</FormLabel>

                <FormControl>
                  <InputField
                    {...field}
                    label=""
                    placeholder="Confirm your password"
                    type="password"
                    error={fieldState.error?.message ?? null}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" isLoading={loading} className="w-full mt-2">
            Update
          </Button>
        </form>
      </Form>
    </div>
  );
}
