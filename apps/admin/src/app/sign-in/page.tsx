import type { Metadata } from "next";
import Image from "next/image";
import { SignInForm } from "@/features/auth/SignInForm";
import { withBasePath } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
	return (
		<main className="flex min-h-dvh items-center justify-center bg-primary-500 px-4 py-10">
			<div className="animate-rise w-full max-w-md rounded-[15px] bg-neutral-500 p-6 shadow-xl sm:p-10">
				<Image src={withBasePath("/logo-primary.svg")} alt="Stellance" width={48} height={48} className="h-10 w-auto" unoptimized priority />
				<h1 className="h2-auth mt-6">Admin console</h1>
				<p className="mt-1 mb-8 text-sm text-black-400">Sign in with an administrator account.</p>
				<SignInForm />
			</div>
		</main>
	);
}
