import type { Metadata, Viewport } from "next";
import { Toaster } from "@repo/ui/sonner";
import GoogleAuthProviders from "@/components/providers/GoogleAuthProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, SITE_URL, THEME_COLOR, TWITTER_HANDLE } from "@/lib/site";
import "./globals.css";

const TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

/**
 * App metadata. Icons and the manifest come from file conventions in this folder
 * (favicon.ico · apple-icon.png · manifest.ts). Pages set `title` and get "%s | Stellance".
 * The app sits behind sign-in, so robots.ts keeps it out of search; links shared from it
 * (client invoices) still get the full social card.
 */
export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: SITE_KEYWORDS,
	authors: [{ name: SITE_NAME }],
	creator: SITE_NAME,
	// Amounts, dates and wallet addresses must not turn into tap-to-call or map links.
	formatDetection: { telephone: false, email: false, address: false, date: false },
	robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
	openGraph: {
		type: "website",
		locale: "en_US",
		siteName: SITE_NAME,
		title: TITLE,
		description: "Pay invoices in USDC on Stellar. Every payment is verified against its invoice.",
		url: "/",
	},
	twitter: {
		card: "summary_large_image",
		site: TWITTER_HANDLE,
		creator: TWITTER_HANDLE,
		title: TITLE,
		description: "Pay invoices in USDC on Stellar. Every payment is verified against its invoice.",
	},
};

export const viewport: Viewport = {
	themeColor: THEME_COLOR,
	// Shrink the layout viewport when the keyboard opens instead of covering inputs.
	interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className="antialiased">
			<body>
				<GoogleAuthProviders>
					<ReactQueryProvider>
						<main>{children}</main>
						<Toaster position="top-right" richColors />
					</ReactQueryProvider>
				</GoogleAuthProviders>
			</body>
		</html>
	);
}
