"use client";

import { useState } from "react";
import { DEMO_ACCOUNT, USE_MOCK_API, resetDemoData } from "@/lib/api/source";

/** Demo data only: the account to sign in with, and a way back to the original data. */
export function DemoAccountNote() {
	const [resetting, setResetting] = useState(false);
	if (!USE_MOCK_API) return null;

	const reset = async () => {
		setResetting(true);
		await resetDemoData();
		window.location.reload();
	};

	return (
		<div className="animate-rise mt-6 rounded-[10px] border border-dashed border-primary-200 bg-primary-20 p-4 text-sm">
			<p className="font-bold">Demo mode</p>
			<p className="mt-1 text-black-400">
				Everything runs on sample data in your browser. Sign in with <strong className="break-all">{DEMO_ACCOUNT.email}</strong> and{" "}
				<strong>{DEMO_ACCOUNT.password}</strong>, or use Continue with Google.
			</p>
			<button type="button" onClick={reset} disabled={resetting} className="mt-2 cursor-pointer text-xs font-medium underline underline-offset-4 disabled:opacity-50">
				{resetting ? "Resetting…" : "Reset demo data"}
			</button>
		</div>
	);
}
