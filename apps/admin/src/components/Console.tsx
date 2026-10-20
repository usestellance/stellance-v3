"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight, Search, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "@repo/ui/animated-number";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Skeleton } from "@repo/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import type { PageMeta } from "@/features/admin/types";

/** The console's building blocks, in the Stellance app style (navy, tinted panels, 10px radius). */

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
	return (
		<header className="animate-rise flex flex-wrap items-end justify-between gap-4">
			<div className="min-w-0">
				<h1 className="h2-app">{title}</h1>
				{description && <p className="mt-1 max-w-2xl text-sm text-neutral-900 md:text-base">{description}</p>}
			</div>
			{actions}
		</header>
	);
}

export function Panel({ title, action, children, className, index = 0 }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; index?: number }) {
	return (
		<section className={clsx("animate-rise rounded-[10px] border border-primary-50 bg-neutral-500 p-4 sm:p-6", className)} style={{ "--i": index } as React.CSSProperties}>
			{(title || action) && (
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					{title && <h2 className="font-semibold sm:text-lg">{title}</h2>}
					{action}
				</div>
			)}
			{children}
		</section>
	);
}

export function StatCard({ label, value, format, hint, index = 0, tone = "default" }: { label: string; value: number | undefined; format?: (n: number) => string; hint?: string; index?: number; tone?: "default" | "danger" | "success" }) {
	return (
		<div
			className="animate-rise flex flex-col gap-2 rounded-[10px] border-[0.5px] border-primary-500/15 bg-neutral-500 p-4 shadow-lg shadow-[#8392cd]/20 sm:p-5"
			style={{ "--i": index } as React.CSSProperties}
		>
			<p className="text-[11px] font-medium tracking-wide text-neutral-900 uppercase sm:text-xs">{label}</p>
			<p className={clsx("text-xl font-semibold tracking-tight sm:text-[26px]", tone === "danger" ? "text-error-400" : tone === "success" ? "text-success-500" : "text-primary-500")}>
				{value === undefined ? <Skeleton className="h-7 w-20" /> : <AnimatedNumber value={value} format={format} />}
			</p>
			{hint && <p className="text-xs text-neutral-900">{hint}</p>}
		</div>
	);
}

const TONES = {
	neutral: "bg-primary-50 text-primary-500",
	info: "bg-info-100 text-info-500",
	success: "bg-success-50 text-success-600",
	warning: "bg-warning-100 text-warning-800",
	danger: "bg-error-50 text-error-500",
	muted: "bg-neutral-600 text-neutral-900",
} as const;

export type Tone = keyof typeof TONES;

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
	return <span className={clsx("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap capitalize", TONES[tone])}>{children}</span>;
}

/** One mapping per status family, so every table colours them the same way. */
export const INVOICE_TONE: Record<string, Tone> = { draft: "muted", sent: "info", viewed: "neutral", paid: "success", overdue: "danger", cancelled: "muted" };
export const TX_TONE: Record<string, Tone> = { confirmed: "success", pending: "warning", failed: "danger" };
export const PAYMENT_TONE: Record<string, Tone> = { detected: "info", verified: "success", invalid: "danger", unmatched: "warning", failed: "danger" };

export interface Column<T> {
	key: string;
	header: string;
	cell: (row: T) => React.ReactNode;
	className?: string;
}

/** A table on wide screens and a stack of cards on phones; rows open `onRowClick`. */
export function DataTable<T>({ rows, columns, rowKey, onRowClick, loading, empty = "Nothing to show yet." }: { rows: T[] | undefined; columns: Column<T>[]; rowKey: (row: T) => string; onRowClick?: (row: T) => void; loading?: boolean; empty?: string }) {
	if (loading && !rows) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 6 }, (_, i) => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		);
	}
	if (!rows?.length) return <p className="py-14 text-center text-neutral-900">{empty}</p>;

	return (
		<>
			<div className="hidden overflow-x-auto md:block">
				<Table>
					<TableHeader>
						<TableRow className="border-primary-50">
							{columns.map((c) => (
								<TableHead key={c.key} className={clsx("text-left text-xs font-medium whitespace-nowrap text-neutral-900", c.className)}>
									{c.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row, i) => (
							<TableRow
								key={rowKey(row)}
								onClick={onRowClick ? () => onRowClick(row) : undefined}
								className={clsx("animate-rise border-primary-50", onRowClick && "cursor-pointer hover:bg-primary-20")}
								style={{ "--i": Math.min(i, 10) } as React.CSSProperties}
							>
								{columns.map((c) => (
									<TableCell key={c.key} className={clsx("py-3 text-left whitespace-nowrap", c.className)}>
										{c.cell(row)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<ul className="space-y-3 md:hidden">
				{rows.map((row, i) => (
					<li key={rowKey(row)} className="animate-rise" style={{ "--i": Math.min(i, 10) } as React.CSSProperties}>
						<div
							role={onRowClick ? "button" : undefined}
							tabIndex={onRowClick ? 0 : undefined}
							onClick={onRowClick ? () => onRowClick(row) : undefined}
							onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(row) : undefined}
							className={clsx("rounded-[10px] border border-primary-50 bg-primary-20 p-4", onRowClick && "cursor-pointer active:bg-primary-50")}
						>
							<dl className="grid grid-cols-[minmax(0,1fr)] gap-2 text-sm">
								{columns.map((c) => (
									<div key={c.key} className="flex items-center justify-between gap-3">
										<dt className="shrink-0 text-xs text-neutral-900">{c.header}</dt>
										<dd className="min-w-0 truncate text-right">{c.cell(row)}</dd>
									</div>
								))}
							</dl>
						</div>
					</li>
				))}
			</ul>
		</>
	);
}

export function Pagination({ meta, onPage }: { meta: PageMeta | undefined; onPage: (page: number) => void }) {
	if (!meta || meta.total_pages <= 1) return null;
	return (
		<nav className="mt-5 flex items-center justify-between gap-3 text-sm" aria-label="Pagination">
			<span className="text-neutral-900">
				Page {meta.page} of {meta.total_pages} · {meta.total} total
			</span>
			<div className="flex gap-2">
				<Button variant="outline" size="icon" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="Previous page">
					<ChevronLeft />
				</Button>
				<Button variant="outline" size="icon" disabled={meta.page >= meta.total_pages} onClick={() => onPage(meta.page + 1)} aria-label="Next page">
					<ChevronRight />
				</Button>
			</div>
		</nav>
	);
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
	return (
		<label className="relative block w-full sm:max-w-sm">
			<span className="sr-only">{placeholder}</span>
			<Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-900" />
			<input
				type="search"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="h-11 w-full rounded-lg border border-primary-50 bg-neutral-500 pr-3 pl-9 text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
			/>
		</label>
	);
}

export function FilterChips<V extends string>({ value, options, onChange, label }: { value: V; options: { value: V; label: string }[]; onChange: (value: V) => void; label: string }) {
	return (
		<div className="flex flex-wrap gap-2" role="group" aria-label={label}>
			{options.map((o) => (
				<button
					key={o.value}
					type="button"
					aria-pressed={value === o.value}
					onClick={() => onChange(o.value)}
					className={clsx("h-9 cursor-pointer rounded-full px-4 text-sm font-medium transition-colors", value === o.value ? "bg-primary-500 text-white" : "bg-primary-50 text-primary-500 hover:bg-primary-100")}
				>
					{o.label}
				</button>
			))}
		</div>
	);
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
	return (
		<p className="flex items-start gap-2 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-500" role="alert">
			<TriangleAlert size={16} className="mt-0.5 shrink-0" />
			<span>{children}</span>
		</p>
	);
}

export function KeyValue({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1 border-b border-primary-50 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
			<dt className="text-sm text-neutral-900">{label}</dt>
			<dd className="min-w-0 text-sm font-medium break-all sm:text-right">{children}</dd>
		</div>
	);
}

/**
 * Asks before something hard to undo. With `confirmText`, the admin types it to enable the button
 * (deleting an account).
 */
export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	confirmText,
	danger,
	pending,
	error,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: React.ReactNode;
	confirmLabel: string;
	confirmText?: string;
	danger?: boolean;
	pending?: boolean;
	error?: string | null;
	onConfirm: () => void;
}) {
	const [typed, setTyped] = useState("");
	const blocked = !!confirmText && typed.trim() !== confirmText;

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setTyped("");
				onOpenChange(next);
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{confirmText && (
					<label className="block text-sm">
						Type <strong className="break-all">{confirmText}</strong> to confirm
						<input
							value={typed}
							onChange={(e) => setTyped(e.target.value)}
							className="mt-2 h-11 w-full rounded-lg border border-primary-50 px-3 outline-none focus:border-primary-300"
							autoComplete="off"
						/>
					</label>
				)}
				{error && <ErrorNote>{error}</ErrorNote>}
				<DialogFooter className="gap-2 sm:gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)} className="sm:w-auto sm:px-6">
						Cancel
					</Button>
					<Button variant={danger ? "destructive" : "default"} disabled={blocked || pending} onClick={onConfirm} className="sm:w-auto sm:px-6">
						{pending ? "Working…" : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
