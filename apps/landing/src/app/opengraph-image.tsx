import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@repo/ui/og-card";

/** The link preview (Open Graph; twitter-image.tsx reuses it). Rendered once at build time. */
export const alt = "Stellance: invoice anyone, anywhere and get paid in USDC on Stellar, with every payment verified.";
export const size = OG_SIZE;
export const contentType = "image/png";

const png = (file: Buffer) => `data:image/png;base64,${file.toString("base64")}`;

export default async function Image() {
	const [bold, medium, logo, background, illustration] = await Promise.all([
		readFile(join(process.cwd(), "../../packages/ui/src/assets/fonts/static/Satoshi-Bold.ttf")),
		readFile(join(process.cwd(), "../../packages/ui/src/assets/fonts/static/Satoshi-Medium.ttf")),
		readFile(join(process.cwd(), "src/app/apple-icon.png")).then(png),
		readFile(join(process.cwd(), "public/images/hero-bg.png")).then(png),
		readFile(join(process.cwd(), "public/images/phone_hand.png")).then(png),
	]);

	return new ImageResponse(
		<OgCard
			logo={logo}
			background={background}
			illustration={illustration}
			eyebrow="Live on Stellar Testnet"
			title="Invoice anyone, anywhere. Get paid in seconds."
			subtitle="Invoices paid in USDC on Stellar, with every payment verified automatically."
			showStatus={true}
		/>,
		{
			...size,
			fonts: [
				{ name: "Satoshi", data: bold, weight: 700, style: "normal" },
				{ name: "Satoshi", data: medium, weight: 500, style: "normal" },
			],
		},
	);
}
