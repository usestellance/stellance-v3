import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@repo/ui/og-card";

/** The link preview (Open Graph; twitter-image.tsx reuses it). Rendered once at build time. */
export const alt = "Stellance: pay invoices in USDC on Stellar, with every payment verified on-chain.";
export const size = OG_SIZE;
export const contentType = "image/png";

const png = (file: Buffer) => `data:image/png;base64,${file.toString("base64")}`;

export default async function Image() {
	const [bold, medium, logo] = await Promise.all([
		readFile(join(process.cwd(), "../../packages/ui/src/assets/fonts/static/Satoshi-Bold.ttf")),
		readFile(join(process.cwd(), "../../packages/ui/src/assets/fonts/static/Satoshi-Medium.ttf")),
		readFile(join(process.cwd(), "src/app/apple-icon.png")).then(png),
	]);

	return new ImageResponse(
		<OgCard
			logo={logo}
			eyebrow="Invoices on Stellar Testnet"
			title="Pay invoices in USDC, verified on Stellar."
			subtitle="Payment requests from Stellance businesses. Pay from any Stellar wallet with a QR code or link."
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
