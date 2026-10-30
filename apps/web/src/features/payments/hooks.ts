"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { getInvoicePayment, getPayment, getPaymentRequest, listPayments } from "@/features/payments/api";
import { PAYMENT_STATUS } from "@/features/payments/status";
import type { InvoicePaymentState, VerificationStatus } from "@/features/payments/types";

/** How often an open invoice re-reads its status. The API detects a payment ~5–15 s after its ledger closes. */
const POLL_MS = 6_000;

const retry = { retry: 3, retryDelay: (attempt: number) => Math.min(1_000 * 2 ** attempt, 15_000) };

const stillOpen = (state: InvoicePaymentState | undefined) =>
	!state || (!PAYMENT_STATUS[state.status].final && state.status !== "not_started");

/** When the payment settles, refresh everything that shows the invoice's status. */
function useRefreshOnSettle(state: InvoicePaymentState | undefined) {
	const queryClient = useQueryClient();
	const previous = useRef<string | undefined>(undefined);
	useEffect(() => {
		const status = state?.status;
		if (previous.current && status && previous.current !== status) {
			// "user" carries the wallet balance.
			for (const key of ["invoice", "client_invoice", "invoices", "payment", "payments", "notifications", "transactions", "user"]) {
				queryClient.invalidateQueries({ queryKey: [key] });
			}
		}
		previous.current = status;
	}, [state?.status, queryClient]);
}

/** The signed-in merchant's receiving wallet. */
export function useMerchantWallet() {
	return useAuthStore((state) => state.credentials?.user?.wallet?.address);
}

/** The customer's view of an invoice's payment request (public), polled while it can still change. */
export function usePaymentRequest(invoiceUrl: string | undefined) {
	const query = useQuery({
		queryKey: ["payment-request", invoiceUrl],
		queryFn: () => getPaymentRequest(invoiceUrl!),
		enabled: !!invoiceUrl,
		refetchInterval: (q) => (stillOpen(q.state.data) ? POLL_MS : false),
		...retry,
	});
	useRefreshOnSettle(query.data);
	return query;
}

/** The merchant's view: the request plus every payment attempt, polled while it can still change. */
export function useInvoicePayment(invoiceId: string | undefined, options: { poll?: boolean } = {}) {
	const query = useQuery({
		queryKey: ["invoice-payment", invoiceId],
		queryFn: () => getInvoicePayment(invoiceId!),
		enabled: !!invoiceId,
		refetchInterval: (q) => (options.poll !== false && stillOpen(q.state.data) ? POLL_MS : false),
		...retry,
	});
	useRefreshOnSettle(query.data);
	return query;
}

/** Payments received to the merchant's wallets, with the API's verdict on each. */
export function useMerchantPayments(options: { poll?: boolean; status?: VerificationStatus } = {}) {
	const token = useAuthStore((state) => state.credentials?.access_token);
	const query = useQuery({
		queryKey: ["payments", options.status ?? "all"],
		queryFn: () => listPayments(options.status),
		enabled: !!token,
		refetchInterval: options.poll ? POLL_MS * 2 : false,
		...retry,
	});
	return { payments: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
}

/** One payment by id, re-read while the API is still verifying it. */
export function usePayment(id: string | undefined) {
	const token = useAuthStore((state) => state.credentials?.access_token);
	const query = useQuery({
		queryKey: ["payment", id],
		queryFn: () => getPayment(id!),
		enabled: !!token && !!id,
		refetchInterval: (q) => (q.state.data?.status === "detected" ? POLL_MS : false),
		...retry,
	});
	return { payment: query.data ?? null, isLoading: query.isLoading, isError: query.isError };
}
