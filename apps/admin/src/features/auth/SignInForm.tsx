"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { ErrorNote } from "@/components/Console";
import { useAdminSession } from "@/features/auth/session";
import { api, errorMessage } from "@/lib/api/client";
import { DEMO_ADMIN, USE_MOCK_API } from "@/lib/api/source";

/**
 * Signs in with the API's /auth/login, then proves the account is an admin by reading /admin/stats.
 * Anyone else is refused here, before the console renders.
 */
export function SignInForm() {
	const router = useRouter();
	const signIn = useAdminSession((s) => s.signIn);
	const signOut = useAdminSession((s) => s.signOut);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		if (!email.trim() || !password) return setError("Enter your email and password.");
		setPending(true);
		try {
			const { data } = await api.post("/auth/login", { email: email.trim(), password });
			const { access_token, expires_in, user } = data.data;
			signIn({ token: access_token, email: user.email, name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(), expiresAt: expires_in });
			try {
				await api.get("/admin/stats");
			} catch (e) {
				signOut();
				if (axios.isAxiosError(e) && (e.response?.status === 403 || e.response?.status === 401)) {
					throw new Error("This account doesn't have admin access.");
				}
				throw e;
			}
			router.replace("/");
		} catch (e) {
			setError(e instanceof Error && !axios.isAxiosError(e) ? e.message : errorMessage(e, "Couldn't sign in. Try again."));
		} finally {
			setPending(false);
		}
	};

	return (
		<form onSubmit={submit} noValidate className="space-y-5">
			<label className="block text-sm font-medium">
				Email
				<input
					type="email"
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="mt-2 h-12 w-full rounded-lg border border-neutral-700 px-4 text-base outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
				/>
			</label>
			<label className="block text-sm font-medium">
				Password
				<input
					type="password"
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="mt-2 h-12 w-full rounded-lg border border-neutral-700 px-4 text-base outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
				/>
			</label>
			{error && <ErrorNote>{error}</ErrorNote>}
			<Button type="submit" disabled={pending}>
				{pending ? "Signing in…" : "Sign in"}
			</Button>
			{USE_MOCK_API && (
				<p className="rounded-[10px] border border-dashed border-primary-200 bg-primary-20 p-3 text-sm">
					Demo data: sign in with <strong className="break-all">{DEMO_ADMIN.email}</strong> and <strong>{DEMO_ADMIN.password}</strong>.
				</p>
			)}
		</form>
	);
}
