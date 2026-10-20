import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@repo/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
	return (
		<div className="landing-container flex min-h-screen flex-col items-center justify-center text-center">
			<h1 className="text-[64px] font-bold text-primary-500 lg:text-[128px]">404</h1>
			<p className="font-light lg:text-[36px]">
				Sorry, the content you&apos;re looking for doesn&apos;t exist.
				<br className="max-lg:hidden" /> Either it was removed, or you mistyped the link.
			</p>
			<Button asChild className="mt-10 max-w-[250px] sm:max-w-[500px]">
				<Link href="/">Go Back Home</Link>
			</Button>
		</div>
	);
}
