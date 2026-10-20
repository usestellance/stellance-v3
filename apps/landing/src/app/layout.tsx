import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, SITE_URL, THEME_COLOR, TWITTER_HANDLE } from "@/lib/site";
import "./globals.css";

const TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
const SHARE_DESCRIPTION = "Invoices paid in USDC on Stellar, with every payment verified automatically.";

/**
 * Icons and link previews come from file conventions in this folder: favicon.ico, apple-icon.png,
 * opengraph-image.tsx and twitter-image.tsx (1200×630, rendered at build time).
 */
export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
	description: SITE_DESCRIPTION,
	keywords: SITE_KEYWORDS,
	authors: [{ name: SITE_NAME }],
	creator: SITE_NAME,
	alternates: { canonical: "/" },
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		siteName: SITE_NAME,
		title: TITLE,
		description: SHARE_DESCRIPTION,
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description: SHARE_DESCRIPTION,
		creator: TWITTER_HANDLE,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: { index: true, follow: true, "max-image-preview": "large" },
	},
};

export const viewport: Viewport = { themeColor: THEME_COLOR };

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className="antialiased">
			<body>{children}</body>
		</html>
	);
}
