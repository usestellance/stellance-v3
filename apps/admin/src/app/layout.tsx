import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { SITE_NAME, SITE_URL, THEME_COLOR } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
	description: "Stellance platform administration: users, invoices, transactions and payment verification.",
	robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
	openGraph: { type: "website", siteName: SITE_NAME, title: SITE_NAME, url: "/" },
};

export const viewport: Viewport = { themeColor: THEME_COLOR };

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className="antialiased">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
