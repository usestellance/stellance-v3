"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

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
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/use-toast";

import { ForgotPasswordSchema } from "@/features/auth/schema";
import { axiosInstance } from "@/lib/api/client";
import { authRoutes, backendRoutes } from "@/lib/routes";
import axios from "axios";

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const toast = useToast();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Countdown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const onSubmit = async (values: ForgotPasswordValues) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        backendRoutes.AUTH_ROUTES.RESET_PASSWORD_EMAIL(values.email),
      );

      if (res.data) {
        setLoading(false);
        toast.success(res?.data?.message);
        router.push(authRoutes.RESET_PASSWORD(values.email));
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isDisabled = loading || cooldown > 0;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* --------------------------------
              EMAIL FIELD
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
                    label=""
                    placeholder="Email address"
                    type="email"
                    error={fieldState.error?.message ?? null}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            isLoading={loading}
            disabled={isDisabled}
            className="w-full md:mt-2"
          >
            {cooldown > 0
              ? `Resend in ${formatTime(cooldown)}`
              : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
