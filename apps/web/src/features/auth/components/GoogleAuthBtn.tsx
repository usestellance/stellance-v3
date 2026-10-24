"use client";

import { useGoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import { Button } from "@repo/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/use-toast";
import { authRoutes, overviewRoutes } from "@/lib/routes";
import { axiosInstance } from "@/lib/api/client";
import { USE_MOCK_API } from "@/lib/api/source";

export default function GoogleAuthBtn() {
  const router = useRouter();
  const toast = useToast();

  /**
   * Exchanges the Google identity for a Stellance session. The Google access token goes along so the
   * API can verify the identity with Google instead of trusting the email (backend gap: /auth/social
   * currently accepts unverified emails).
   */
  const signIn = async (email: string, providerId: string, accessToken?: string) => {
    try {
      const res = await axiosInstance.post("/auth/social", {
        email,
        provider_id: providerId, // Google unique user id
        ...(accessToken ? { access_token: accessToken, provider: "google" } : {}),
      });

      const data = res.data;
      const expiryDate = new Date(data.data.expires_in * 1000);

      Cookies.set("access_token", data.data.access_token, {
        expires: expiryDate,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
      });

      toast.success(data.message || "Login Successful");
      router.push(
        data.data.profile_complete
          ? overviewRoutes.OVERVIEW
          : authRoutes.COMPLETE_PROFILE,
      );
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Google authentication failed");
    }
  };

  const login = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const user = await userInfoRes.json(); // has `email` and `sub`
        await signIn(user.email, user.sub, tokenResponse.access_token);
      } catch {
        toast.error("Google authentication failed");
      }
    },
    onError: () => toast.error("Google authentication failed"),
  });

  return (
    <Button
      // Demo data: skip Google and sign in to the demo account.
      onClick={() => (USE_MOCK_API ? signIn("demo@usestellance.com", "mock-google") : login())}
      type="button"
      className="w-full bg-white text-black-500 font-normal hover:bg-neutral-100 border border-black-300"
    >
      <FcGoogle size={22} />
      <span>Continue with Google</span>
    </Button>
  );
}
