/**
 * The social preview card (1200×630) every app renders through `next/og` in its `opengraph-image.tsx`.
 * Inline styles only: the image renderer supports a subset of CSS and needs `display: flex` on any
 * element with more than one child. Brand: navy #000C3B, light blue #D9E4F8, Satoshi.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

export interface OgCardProps {
	/** Data URLs (the app reads the files at build time). */
	logo: string;
	background?: string;
	illustration?: string;
	eyebrow: string;
	title: string;
	subtitle: string;
	/** A payment status card in the corner, the product's core idea. */
	showStatus?: boolean;
}

export function OgCard({ logo, background, illustration, eyebrow, title, subtitle, showStatus = true }: OgCardProps) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				position: "relative",
				backgroundColor: "#000c3b",
				backgroundImage: background ? `url(${background})` : "linear-gradient(135deg, #000a2f 0%, #18234f 100%)",
				backgroundSize: "1200px 786px",
				backgroundPosition: "right top",
				fontFamily: "Satoshi",
				color: "#ffffff",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: illustration || showStatus ? 720 : 1056 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
					<div style={{ display: "flex", padding: 6, borderRadius: 16, backgroundColor: "#ffffff" }}>
						<img src={logo} width={48} height={48} alt="" />
					</div>
					<span style={{ fontSize: 34, fontWeight: 700 }}>Stellance</span>
				</div>

				<div style={{ display: "flex", flexDirection: "column" }}>
					<div
						style={{
							display: "flex",
							alignSelf: "flex-start",
							fontSize: 20,
							fontWeight: 500,
							padding: "8px 18px",
							borderRadius: 999,
							border: "1px solid rgba(255,255,255,0.3)",
							backgroundColor: "rgba(255,255,255,0.08)",
						}}
					>
						{eyebrow}
					</div>
					<div style={{ display: "flex", fontSize: 62, fontWeight: 700, lineHeight: 1.08, marginTop: 26, letterSpacing: -1 }}>{title}</div>
					<div style={{ display: "flex", fontSize: 26, fontWeight: 500, lineHeight: 1.4, marginTop: 22, color: "#d9e4f8" }}>{subtitle}</div>
				</div>

				<div style={{ display: "flex", fontSize: 20, color: "#94b9ff", fontWeight: 500 }}>usestellance.com</div>
			</div>

			{illustration && (
				<img src={illustration} alt="" width={560} height={544} style={{ position: "absolute", right: -30, bottom: -20 }} />
			)}

			{showStatus && (
				<div
					style={{
						position: "absolute",
						right: illustration ? 150 : 72,
						top: illustration ? 48 : 200,
						width: 300,
						display: "flex",
						flexDirection: "column",
						padding: 22,
						borderRadius: 20,
						backgroundColor: "#ffffff",
						color: "#14171f",
						boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
					}}
				>
					<div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "#8c8c8c" }}>
						<span>INV-1042</span>
						<span>Stellar Testnet</span>
					</div>
					<div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#000c3b", marginTop: 8 }}>100.00 USDC</div>
					<div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
						<div
							style={{
								display: "flex",
								width: 40,
								height: 40,
								borderRadius: 999,
								backgroundColor: "#d5ffde",
								color: "#007a4d",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 24,
								fontWeight: 700,
							}}
						>
							✓
						</div>
						<div style={{ display: "flex", flexDirection: "column" }}>
							<span style={{ fontSize: 20, fontWeight: 700 }}>Paid</span>
							<span style={{ fontSize: 15, color: "#8c8c8c" }}>Verified on Stellar</span>
						</div>
					</div>
					<div style={{ display: "flex", gap: 6, marginTop: 16 }}>
						<div style={{ display: "flex", flex: 1, height: 6, borderRadius: 999, backgroundColor: "#000c3b" }} />
						<div style={{ display: "flex", flex: 1, height: 6, borderRadius: 999, backgroundColor: "#000c3b" }} />
						<div style={{ display: "flex", flex: 1, height: 6, borderRadius: 999, backgroundColor: "#000c3b" }} />
					</div>
				</div>
			)}
		</div>
	);
}
