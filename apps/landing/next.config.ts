import type { NextConfig } from "next";

/** Where the app (`apps/web`) lives; mirrors APP_URL in src/lib/site.ts. */
const APP_URL =
	process.env.NEXT_PUBLIC_APP_URL ??
	(process.env.VERCEL_ENV === "production"
		? "https://app.usestellance.com"
		: process.env.NODE_ENV === "development"
			? "http://localhost:3000"
			: "/app");

/**
 * The public site at usestellance.com (Vercel Services; the app has its own
 * subdomain, see the repo root `vercel.json`). No basePath.
 */
const nextConfig: NextConfig = {
	// VERCEL_ENV inlined for client code too (lib/site.ts picks production URLs with it).
	env: { NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "" },
	// A separate output dir for one-off verification builds (`NEXT_DIST_DIR=.next-verify next build`)
	// so they never overwrite the `.next` a running `pnpm dev` is serving from.
	distDir: process.env.NEXT_DIST_DIR || ".next",
	reactCompiler: true,
	transpilePackages: ["@repo/ui"],
	allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
	// Behind Vercel Services the optimizer route (`/_next/image`) does not reach this app,
	// so images are served as they are.
	images: { unoptimized: true },
	// The app used to share this host: links already sent by email (client invoices,
	// verification and password resets) and old bookmarks still point here.
	async redirects() {
		const toApp = (source: string) => ({ source, destination: `${APP_URL}${source}`, permanent: false });
		return [
			"/auth/:path*",
			"/client/:path*",
			"/overview",
			"/invoices/:path*",
			"/invoices",
			"/transactions/:path*",
			"/transactions",
			"/wallet",
			"/profile",
			"/notifications",
		].map(toApp);
	},
};

export default nextConfig;
