"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** The SEP-7 payment link as a QR code, for paying from a phone wallet. Rendered to an SVG string. */
export function PaymentQr({ value, label }: { value: string; label: string }) {
	const [svg, setSvg] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		QRCode.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#000c3b", light: "#ffffff" } })
			.then((markup) => active && setSvg(markup))
			.catch(() => active && setSvg(null));
		return () => {
			active = false;
		};
	}, [value]);

	return (
		<div
			role="img"
			aria-label={label}
			className="animate-pop mx-auto size-44 rounded-lg border border-primary-50 bg-white p-2 [&_svg]:h-full [&_svg]:w-full"
			// The markup comes from the qrcode library, not from user input.
			dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
		/>
	);
}
