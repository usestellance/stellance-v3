"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import type { InvoiceType } from "@/features/invoice/types";
import useAxiosAuth from "@/lib/api/use-axios-auth";
import { PAYMENTS_SOURCE, expectationFor, getPayment, listInvoicePayments, listPayments } from "@/features/payments/api";
import { fetchIncomingPayments, fetchPaymentOperation } from "@/features/payments/horizon";
import type { DetectedPayment, PaymentExpectation } from "@/features/payments/types";
import { classifyPayments, invoicePaymentState } from "@/features/payments/verify";

/** How often open invoices look for new payments. Testnet closes a ledger every ~5 s. */
const POLL_MS = 8_000;

const retry = { retry: 3, retryDelay: (attempt: number) => Math.min(1_000 * 2 ** attempt, 15_000) };

/** The signed-in merchant's receiving wallet. */
export function useMerchantWallet() {
	return useAuthStore((state) => state.credentials?.user?.wallet?.address);
}

/** Incoming payments to one account, shared by every screen that asks (one Horizon call per poll). */
function useIncomingPayments(account: string | undefined, poll: boolean) {
	return useQuery({
		queryKey: ["stellar-payments", account],
		queryFn: () => fetchIncomingPayments(account!),
		enabled: PAYMENTS_SOURCE === "horizon" && !!account,
		refetchInterval: poll ? POLL_MS : false,
		refetchOnWindowFocus: true,
		staleTime: 4_000,
		...retry,
	});
}

/** Every invoice of the merchant, so a memo can be matched to the right one (or to none). */
function useMerchantInvoices() {
	const token = useAuthStore((state) => state.credentials?.access_token);
	const { get } = useAxiosAuth();
	return useQuery({
		queryKey: ["invoices", "all-for-matching"],
		queryFn: async () => {
			const res = await get("/invoice?page=1&page_count=100&order_by=desc");
			return (res.data.data?.invoice ?? []) as InvoiceType[];
		},
		enabled: !!token,
		staleTime: 30_000,
	});
}

/**
 * One invoice's payment status, polled while it can still change. Works signed out too (the customer's
 * payment page), since it reads the network and the invoice's public data only.
 */
export function useInvoicePayment(invoice: InvoiceType | undefined, options: { recipient?: string; poll?: boolean } = {}) {
	const expectation = expectationFor(invoice, options.recipient);
	// Keep looking until the API says the invoice can no longer change.
	const settled = invoice?.status === "paid" || invoice?.status === "cancelled" || invoice?.status === "draft";
	const poll = options.poll !== false && !settled;
	const horizon = useIncomingPayments(expectation?.recipient, poll);
	const api = useQuery({
		queryKey: ["invoice-payments", expectation?.invoiceId],
		queryFn: () => listInvoicePayments(expectation!.invoiceId),
		enabled: PAYMENTS_SOURCE === "api" && !!expectation,
		refetchInterval: poll ? POLL_MS : false,
		...retry,
	});
	const source = PAYMENTS_SOURCE === "api" ? api : horizon;

	const payments = expectation
		? PAYMENTS_SOURCE === "api"
			? (api.data ?? [])
			: classifyPayments(horizon.data ?? [], [expectation])
		: [];
	const state = expectation ? invoicePaymentState(expectation, invoice?.status, payments) : null;

	// Verified on Stellar but not yet marked paid: re-read the invoice until the API confirms it.
	const queryClient = useQueryClient();
	useQuery({
		queryKey: ["invoice-confirmation", expectation?.invoiceId],
		queryFn: async () => {
			await queryClient.invalidateQueries({ queryKey: ["invoice", expectation?.invoiceId] });
			await queryClient.invalidateQueries({ queryKey: ["client_invoice"] });
			await queryClient.invalidateQueries({ queryKey: ["invoices"] });
			return Date.now();
		},
		enabled: state?.status === "verified",
		refetchInterval: 3_000,
	});

	return {
		state,
		expectation,
		isLoading: source.isLoading,
		isError: source.isError,
		error: source.error,
		updatedAt: source.dataUpdatedAt,
	};
}

/** All incoming payments to the merchant's wallet, each checked against all of the merchant's invoices. */
export function useMerchantPayments(options: { poll?: boolean } = {}) {
	const wallet = useMerchantWallet();
	const invoices = useMerchantInvoices();
	const horizon = useIncomingPayments(wallet, options.poll ?? true);
	const api = useQuery({
		queryKey: ["payments"],
		queryFn: listPayments,
		enabled: PAYMENTS_SOURCE === "api",
		refetchInterval: options.poll ? POLL_MS : false,
		...retry,
	});

	if (PAYMENTS_SOURCE === "api") {
		return { payments: api.data ?? [], invoices: invoices.data ?? [], isLoading: api.isLoading, isError: api.isError, wallet };
	}

	const expectations = (invoices.data ?? [])
		.map((invoice) => expectationFor(invoice, wallet))
		.filter((e): e is PaymentExpectation => e !== null);
	const payments: DetectedPayment[] = classifyPayments(horizon.data ?? [], expectations);

	return {
		payments,
		invoices: invoices.data ?? [],
		isLoading: horizon.isLoading || invoices.isLoading,
		isError: horizon.isError || invoices.isError,
		wallet,
	};
}

/** One payment by id: from the merchant's list, or fetched on its own when it's older than that page. */
export function usePayment(id: string | undefined) {
	const merchant = useMerchantPayments({ poll: false });
	const listed = merchant.payments.find((p) => p.id === id);
	const lookup = useQuery({
		queryKey: ["payment", id, PAYMENTS_SOURCE],
		queryFn: async () => {
			if (PAYMENTS_SOURCE === "api") return getPayment(id!);
			const observed = await fetchPaymentOperation(id!);
			if (!observed) return null;
			const expectations = merchant.invoices
				.map((invoice) => expectationFor(invoice, merchant.wallet))
				.filter((e): e is PaymentExpectation => e !== null);
			return classifyPayments([observed], expectations)[0] ?? null;
		},
		enabled: !!id && !merchant.isLoading && !listed,
		...retry,
	});

	const payment = listed ?? lookup.data ?? null;
	const invoice = payment?.invoiceId ? merchant.invoices.find((i) => i.id === payment.invoiceId) : undefined;
	return { payment, invoice, isLoading: merchant.isLoading || lookup.isLoading, isError: lookup.isError };
}

/** An invoice's payment status for list rows: derived from the one shared payments query. */
export function useInvoicePaymentStatus(invoice: InvoiceType) {
	const { payments, wallet } = useMerchantPayments({ poll: false });
	const expectation = expectationFor(invoice, wallet);
	return expectation ? invoicePaymentState(expectation, invoice.status, payments).status : null;
}
