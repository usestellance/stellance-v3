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
import { authRoutes } from "@/lib/routes";
import { SignInSchema } from "@/features/auth/schema";
import Link from "next/link";
import { useLogin } from "@/features/auth/hooks";
import GoogleAuthBtn from "@/features/auth/components/GoogleAuthBtn";

type SignInValues = z.infer<typeof SignInSchema>;

export default function SignInForm() {
  const { mutate, isPending } = useLogin();

  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignInValues) => {
    const { email, password } = values;
    mutate({ email, password });
  };

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

          {/* --------------------------------
              PASSWORD FIELD
          -------------------------------- */}
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>

                <FormControl>
                  <div>
                    <InputField
                      {...field}
                      label=""
                      placeholder="Enter your password"
                      type="password"
                      error={fieldState.error?.message ?? null}
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex -mt-2">
            <Link
              className="text-info-300 text-xs"
              href={authRoutes.FORGOT_PASSWORD}
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" isLoading={isPending} className="w-full">
            Sign in
          </Button>
        </form>
      </Form>
      <p className="mt-2.5 mb-[15px] text-sm text-center">OR</p>

      <GoogleAuthBtn />
      {/* <Button
        type="submit"
        className="w-full bg-white text-black-500 font-normal hover:bg-neutral-100 border border-black-300"
      >
        <FcGoogle size={22} />
        <span>Continue with Google</span>
      </Button> */}
    </div>
  );
}
