/** Brand copy for the root layout's metadata. */
const SITE_NAME = "Stellance";
const SITE_TAGLINE = "Do Business Worldwide";
const SITE_DESCRIPTION =
	"Stellance is a next-generation invoicing and payment platform built on the Stellar network. We help businesses, freelancers, and digital entrepreneurs send invoices, receive cross-border payments, and manage settlements instantly, without the friction of traditional banking systems.";

const SITE_KEYWORDS = ["invoice", "invoices", "invoice platform", "Stellar", "USDC", "cross-border payments", "Stellance"];

const TWITTER_HANDLE = "@stellance";

/** Mirrors `--color-primary-500` in packages/ui globals.css. */
const THEME_COLOR = "#000c3b";

/** Production hosts. Each app owns its own subdomain (repo root `vercel.json`). */
const PRODUCTION_ORIGIN = "https://app.usestellance.com";
const LANDING_PRODUCTION_ORIGIN = "https://usestellance.com";

/** Read through next.config `env`, so client components agree with the server render. */
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

/**
 * Absolute site URL for `metadataBase`: NEXT_PUBLIC_SITE_URL → app.usestellance.com
 * on Vercel production → the deployment URL on previews → localhost in dev.
 */
const ORIGIN =
	process.env.NEXT_PUBLIC_SITE_URL ??
	(IS_PRODUCTION ? PRODUCTION_ORIGIN : undefined) ??
	(process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ??
	"http://localhost:3000";

/** This app's base path: `/app` on previews, empty in production and dev (next.config.ts). */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix app-local assets when this app is mounted below the site root (previews). */
function withBasePath(src: string) {
	return BASE_PATH && src.startsWith("/") && !src.startsWith(`${BASE_PATH}/`) ? `${BASE_PATH}${src}` : src;
}

/** Includes the base path, so previews resolve metadata URLs under `/app`. */
const SITE_URL = new URL(`${BASE_PATH}/`, ORIGIN);

/** The landing site (`apps/landing`): usestellance.com in production, `/` on a
 * preview's shared host, its own port in dev. Link to it with a plain <a>. */
const LANDING_URL =
	process.env.NEXT_PUBLIC_LANDING_URL ??
	(IS_PRODUCTION ? LANDING_PRODUCTION_ORIGIN : process.env.NODE_ENV === "development" ? "http://localhost:3002" : "/");

export {
	SITE_NAME,
	SITE_TAGLINE,
	SITE_DESCRIPTION,
	SITE_KEYWORDS,
	TWITTER_HANDLE,
	THEME_COLOR,
	SITE_URL,
	BASE_PATH,
	withBasePath,
	LANDING_URL,
};
