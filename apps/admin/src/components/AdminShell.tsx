"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, FileText, LayoutDashboard, LogOut, Menu, Network, ShieldCheck, Users, X } from "lucide-react";
import { useAdminSession } from "@/features/auth/session";
import { USE_MOCK_API } from "@/lib/api/source";
import { withBasePath } from "@/lib/site";

const NAV = [
	{ href: "/", label: "Overview", icon: LayoutDashboard },
	{ href: "/users", label: "Users", icon: Users },
	{ href: "/invoices", label: "Invoices", icon: FileText },
	{ href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
	{ href: "/payments", label: "Payment review", icon: ShieldCheck },
	{ href: "/network", label: "Network", icon: Network },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** Sidebar on desktop; below `lg` a menu that slides in over a dimmed page and closes on navigation. */
export function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const { name, email, signOut } = useAdminSession();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	const logout = () => {
		signOut();
		router.replace("/sign-in");
	};

	const nav = (
		<nav className="flex flex-1 flex-col gap-1" aria-label="Console">
			{NAV.map(({ href, label, icon: Icon }) => (
				<Link
					key={href}
					href={href}
					onClick={() => setOpen(false)}
					aria-current={isActive(pathname, href) ? "page" : undefined}
					className={clsx(
						"flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
						isActive(pathname, href) ? "bg-white text-primary-500" : "text-neutral-600 hover:bg-white/10 hover:text-white",
					)}
				>
					<Icon size={18} />
					{label}
				</Link>
			))}
		</nav>
	);

	const footer = (
		<div className="border-t border-white/10 pt-4">
			<p className="truncate text-sm font-medium text-white">{name || "Admin"}</p>
			<p className="truncate text-xs text-neutral-800">{email}</p>
			<button type="button" onClick={logout} className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-neutral-600 hover:text-white">
				<LogOut size={16} /> Sign out
			</button>
		</div>
	);

	const brand = (
		<Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
			<Image src={withBasePath("/logo-white.svg")} alt="" width={32} height={32} className="size-8 object-contain" unoptimized priority />
			<span className="font-bold text-white">
				Stellance <span className="font-normal text-neutral-800">Admin</span>
			</span>
		</Link>
	);

	return (
		<div className="min-h-dvh bg-primary-20/40 lg:pl-64">
			<aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 bg-primary-500 p-5 lg:flex">
				{brand}
				{nav}
				{footer}
			</aside>

			<header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-primary-500 px-4 lg:hidden">
				{brand}
				<button type="button" onClick={() => setOpen(true)} className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-white hover:bg-white/10" aria-label="Open menu" aria-expanded={open}>
					<Menu />
				</button>
			</header>

			<div className={clsx("fixed inset-0 z-40 lg:hidden", !open && "pointer-events-none")} inert={!open}>
				<div className={clsx("absolute inset-0 bg-black/40 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
				<aside
					className={clsx(
						"absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-8 rounded-r-[20px] bg-primary-500 p-5 transition-transform duration-300 ease-[var(--ease-settle)]",
						open ? "translate-x-0" : "-translate-x-full",
					)}
				>
					<div className="flex items-center justify-between">
						{brand}
						<button type="button" onClick={() => setOpen(false)} className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-white hover:bg-white/10" aria-label="Close menu">
							<X />
						</button>
					</div>
					{nav}
					{footer}
				</aside>
			</div>

			{USE_MOCK_API && (
				<p className="bg-warning-100 px-4 py-2 text-center text-xs text-warning-800">Demo data: changes stay in this browser and touch no real accounts.</p>
			)}
			<main className="custom-container py-6 lg:py-10">{children}</main>
		</div>
	);
}
