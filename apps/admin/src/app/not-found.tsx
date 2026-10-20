import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
			<p className="text-[64px] font-bold text-primary-500">404</p>
			<p className="text-neutral-900">That page doesn&apos;t exist in the admin console.</p>
			<Link href="/" className="font-medium text-primary-500 underline underline-offset-4">
				Back to overview
			</Link>
		</main>
	);
}
