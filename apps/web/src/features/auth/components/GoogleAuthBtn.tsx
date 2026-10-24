"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import { Button } from "@repo/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/use-toast";
import { authRoutes, overviewRoutes } from "@/lib/routes";
import { axiosInstance } from "@/lib/api/client";
import { USE_MOCK_API } from "@/lib/api/source";

/** Google renders its button at a fixed pixel width, 200 to 400. */
const clampWidth = (px: number) => Math.round(Math.min(400, Math.max(200, px)));

export default function GoogleAuthBtn() {
  const router = useRouter();
  const toast = useToast();
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => entry && setWidth(clampWidth(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /**
   * Exchanges a Google ID token for a Stellance session. The API verifies the token itself (signature,
   * audience, expiry, verified email), so nothing else about the user is sent.
   */
  const signIn = async (idToken: string) => {
    try {
      const res = await axiosInstance.post("/auth/social", { id_token: idToken });

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

  // Demo data: no Google round trip; the mock signs straight into the demo account.
  if (USE_MOCK_API) {
    return (
      <Button
        onClick={() => signIn("mock-google")}
        type="button"
        className="w-full bg-white text-black-500 font-normal hover:bg-neutral-100 border border-black-300"
      >
        <FcGoogle size={22} />
        <span>Continue with Google</span>
      </Button>
    );
  }

  // Google's own button: the only way to get the ID token the API verifies.
  return (
    <div ref={container} className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={({ credential }) => (credential ? signIn(credential) : toast.error("Google authentication failed"))}
        onError={() => toast.error("Google authentication failed")}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="center"
        width={width}
      />
    </div>
  );
}
