import clsx from "clsx";
import { CircleCheck, CircleMinus, CircleX } from "lucide-react";
import type { CheckKey, CheckResult, DetectedPayment } from "@/features/payments/types";

const ROWS: { key: CheckKey; label: string; pass: string; fail: string }[] = [
	{ key: "recipient", label: "Recipient address", pass: "Match", fail: "Mismatch" },
	{ key: "asset", label: "Asset", pass: "Match", fail: "Mismatch" },
	{ key: "amount", label: "Amount", pass: "Match", fail: "Mismatch" },
	{ key: "reference", label: "Payment reference", pass: "Match", fail: "Missing or unknown" },
	{ key: "success", label: "Transaction success", pass: "Success", fail: "Failed" },
	{ key: "invoice", label: "Invoice matching", pass: "Matched", fail: "No invoice" },
];

const ICON: Record<CheckResult, React.ReactNode> = {
	pass: <CircleCheck size={18} className="text-success-500" />,
	fail: <CircleX size={18} className="text-error-400" />,
	skip: <CircleMinus size={18} className="text-neutral-800" />,
};

/** Each PRD check with its result, in the order the API runs them. */
export function VerificationChecklist({ payment }: { payment: DetectedPayment }) {
	return (
		<ul className="divide-y divide-primary-50">
			{ROWS.map((row, i) => {
				const result = payment.checks[row.key];
				return (
					<li key={row.key} className="animate-rise flex items-center justify-between gap-3 py-3" style={{ "--i": i } as React.CSSProperties}>
						<span className="flex min-w-0 items-center gap-2.5 text-sm">
							{ICON[result]}
							<span className="truncate">{row.label}</span>
						</span>
						<span
							className={clsx(
								"shrink-0 text-sm font-medium",
								result === "pass" ? "text-success-600" : result === "fail" ? "text-error-500" : "text-neutral-900",
							)}
						>
							{result === "pass" ? row.pass : result === "fail" ? row.fail : "Not checked"}
						</span>
					</li>
				);
			})}
		</ul>
	);
}
