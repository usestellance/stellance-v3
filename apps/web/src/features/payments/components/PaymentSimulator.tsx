"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import { simulatePayment, type SimulationScenario } from "@/features/payments/api";
import { USE_MOCK_API } from "@/lib/api/source";
import { useToast } from "@/lib/use-toast";

const SCENARIOS: { value: SimulationScenario; label: string }[] = [
	{ value: "correct", label: "Correct payment" },
	{ value: "insufficient", label: "Insufficient amount" },
	{ value: "wrong_asset", label: "Wrong asset (XLM)" },
	{ value: "no_memo", label: "No memo" },
	{ value: "unknown_memo", label: "Unknown reference" },
	{ value: "failed", label: "Failed transaction" },
	{ value: "duplicate", label: "Duplicate payment" },
];

/**
 * Demo data only: plays the customer and the network. Each button sends a Testnet-style payment to the
 * mock backend, which detects it, verifies it a few seconds later and, if valid, marks the invoice paid.
 */
export function PaymentSimulator({ invoiceId }: { invoiceId: string }) {
	const toast = useToast();
	const queryClient = useQueryClient();
	const simulate = useMutation({
		mutationFn: (scenario: SimulationScenario) => simulatePayment(invoiceId, scenario),
		onSuccess: () => {
			toast.info("Payment sent. Watch the status update.");
			for (const key of ["invoice-payments", "payments", "payment", "notifications", "user"]) queryClient.invalidateQueries({ queryKey: [key] });
		},
		onError: () => toast.error("Couldn't simulate the payment"),
	});

	if (!USE_MOCK_API) return null;

	return (
		<details className="group rounded-xl border border-dashed border-primary-200 bg-primary-20 p-4">
			<summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-primary-500">
				<FlaskConical size={16} />
				Simulate a Testnet payment
				<span className="ml-auto text-xs font-normal text-neutral-900 group-open:hidden">Demo data</span>
			</summary>
			<p className="mt-3 text-xs text-neutral-900">
				Demo mode: send a payment as the customer would, and watch it go from detected to verified (or rejected).
			</p>
			<div className="mt-3 flex flex-wrap gap-2">
				{SCENARIOS.map((s) => (
					<button
						key={s.value}
						type="button"
						disabled={simulate.isPending}
						onClick={() => simulate.mutate(s.value)}
						className="h-9 cursor-pointer rounded-full border border-primary-100 bg-white px-3 text-xs font-medium text-primary-500 transition-colors hover:bg-primary-50 disabled:opacity-50"
					>
						{s.label}
					</button>
				))}
			</div>
		</details>
	);
}
