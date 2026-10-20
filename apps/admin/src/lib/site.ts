/** Admin console metadata. Production: admin.usestellance.com (repo root `vercel.json`). */
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const ORIGIN =
	process.env.NEXT_PUBLIC_SITE_URL ??
	(IS_PRODUCTION ? "https://admin.usestellance.com" : undefined) ??
	(process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ??
	"http://localhost:3001";

export const SITE_NAME = "Stellance Admin";
export const SITE_URL = new URL(`${BASE_PATH}/`, ORIGIN);
export const THEME_COLOR = "#000c3b";
export const withBasePath = (src: string) => (BASE_PATH && src.startsWith("/") ? `${BASE_PATH}${src}` : src);
