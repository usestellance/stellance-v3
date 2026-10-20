import type { NextConfig } from "next";

/** admin.usestellance.com in production; `/admin` on a preview's shared host (repo root `vercel.json`). */
const BASE_PATH = process.env.VERCEL_ENV === "preview" ? "/admin" : "";

/** The Stellance API. The browser calls the same-origin `/api/v1` proxy below (no CORS), unless
 * NEXT_PUBLIC_API_URL forces direct calls. */
const API_ORIGIN = process.env.API_PROXY_TARGET || "https://api.usestellance.com/api/v1";
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${BASE_PATH}/api/v1`;

const nextConfig: NextConfig = {
	basePath: BASE_PATH,
	env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH, NEXT_PUBLIC_API_URL: API_URL, NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "" },
	distDir: process.env.NEXT_DIST_DIR || ".next",
	reactCompiler: true,
	transpilePackages: ["@repo/ui", "@repo/mock-api"],
	allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
	async rewrites() {
		return [{ source: "/api/v1/:path*", destination: `${API_ORIGIN}/:path*` }];
	},
};

export default nextConfig;
