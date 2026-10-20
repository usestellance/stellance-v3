/** Brand copy for metadata and structured data. */
const SITE_NAME = "Stellance";
const SITE_TAGLINE = "Do Business Worldwide";
const SITE_DESCRIPTION =
	"Stellance is a next-generation invoicing and payment platform built on the Stellar network. We help businesses, freelancers, and digital entrepreneurs send invoices, receive cross-border payments, and manage settlements instantly, without the friction of traditional banking systems. Whether you're serving clients locally or globally, Stellance makes getting paid simple, fast, and cost-effective.";

const SITE_KEYWORDS = [
	"global payments",
	"international business",
	"payment processing",
	"fiat off-ramp",
	"cross-border payments",
	"online payments",
	"payment gateway",
	"Stellance",
	"Stellar",
	"invoice",
	"invoices",
	"invoice platform",
];

/** Mirrors `--color-primary-500` in packages/ui globals.css. */
const THEME_COLOR = "#000c3b";

const TWITTER_HANDLE = "@stellance";

/** Read through next.config `env`, so client components agree with the server render. */
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

/**
 * Absolute URL of this site, for `metadataBase` / canonical / robots:
 * NEXT_PUBLIC_SITE_URL → usestellance.com on Vercel production → the deployment
 * URL on previews → localhost in dev.
 */
const SITE_URL = new URL(
	process.env.NEXT_PUBLIC_SITE_URL ??
		(IS_PRODUCTION ? "https://usestellance.com" : undefined) ??
		(process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ??
		"http://localhost:3002",
);

/**
 * The app (`apps/web`): app.usestellance.com in production, `/app` on a
 * preview's shared host (Vercel Services), its own port in dev. Links into it
 * are plain <a>s (or `location.assign`): a <Link> would route inside this landing app.
 * Keep in step with APP_URL in next.config.ts (the old-path redirects).
 */
const APP_URL =
	process.env.NEXT_PUBLIC_APP_URL ??
	(IS_PRODUCTION ? "https://app.usestellance.com" : process.env.NODE_ENV === "development" ? "http://localhost:3000" : "/app");

const APP_LINKS = {
	signUp: `${APP_URL}/auth/sign-up`,
	signIn: `${APP_URL}/auth/sign-in`,
};

export { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_KEYWORDS, THEME_COLOR, TWITTER_HANDLE, SITE_URL, APP_URL, APP_LINKS };
