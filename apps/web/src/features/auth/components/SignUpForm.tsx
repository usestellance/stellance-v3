"use client";

import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";

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
import { SignUpSchema } from "@/features/auth/schema";
import { getPasswordStrength } from "@/lib/utils";
import { useRegister } from "@/features/auth/hooks";
import GoogleAuthBtn from "@/features/auth/components/GoogleAuthBtn";

type SignUpValues = z.infer<typeof SignUpSchema>;

export default function SignUpForm() {
  // const [loading, setLoading] = useState(false);
  // const router = useRouter();
  // const toast = useToast();
  const { mutate, isPending } = useRegister();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch password value from RHF
  const passwordValue = useWatch({
    control: form.control,
    name: "password",
  });

  // Calculate strength using useMemo
  const strength = useMemo(() => {
    return getPasswordStrength(passwordValue ?? "");
  }, [passwordValue]);

  const onSubmit = async (values: SignUpValues) => {
    const { email, password } = values;

    mutate({ email, password });
    // setLoading(true);
    // console.log("Submitted:", values);
    // setTimeout(() => {
    //   setLoading(false);
    //   toast.success("Sign up successful! Please verify your email.");
    //   router.push(`${authRoutes.VERIFICATION_SENT}?email=${values.email}`);
    // }, 1000);
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
                <FormLabel>Confirm Password</FormLabel>

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

          <div>
            <p className="text-sm text-center my-[30px]">
              By creating an account you agree to all of our <br />
              <span className="font-bold underline underline-offset-4">
                Terms and Conditions
              </span>{" "}
            </p>
          </div>

          <Button type="submit" isLoading={isPending} className="w-full">
            Sign up
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
