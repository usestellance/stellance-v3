"use client";

import clsx from "clsx";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/lib/use-toast";

/** A labelled value in the app's tinted box, with a copy button that confirms in place. */
export function CopyField({
	label,
	value,
	display,
	hint,
	mono,
	className,
}: {
	label: string;
	value: string;
	/** Shown instead of `value` (e.g. a shortened address); the full value is what gets copied. */
	display?: string;
	hint?: React.ReactNode;
	mono?: boolean;
	className?: string;
}) {
	const toast = useToast();
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			toast.error(`Couldn't copy the ${label.toLowerCase()}`);
		}
	};

	return (
		<div className={className}>
			<p className="mb-2 text-sm text-neutral-900">{label}</p>
			<div className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-primary-50 py-3 pr-2 pl-4">
				<p className={clsx("min-w-0 truncate text-sm font-medium text-primary-500", mono && "font-mono")} title={value}>
					{display ?? value}
				</p>
				<button
					type="button"
					onClick={copy}
					aria-label={`Copy ${label.toLowerCase()}`}
					className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-primary-500 transition-colors hover:bg-primary-100"
				>
					{copied ? <Check size={18} className="animate-pop text-success-500" /> : <Copy size={18} />}
				</button>
			</div>
			{hint && <div className="mt-2 text-xs text-neutral-900">{hint}</div>}
		</div>
	);
}
