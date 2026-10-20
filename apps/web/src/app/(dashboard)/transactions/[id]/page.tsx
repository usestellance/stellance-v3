"use client";
import { Copy } from "lucide-react";
import { useParams } from "next/navigation";
import GoBack from "@/components/GoBack";
import { ExplorerLink } from "@/features/payments/components/ExplorerLink";
import { useToast } from "@/lib/use-toast";
import { useGetTransaction } from "@/features/transactions/hooks";

const TransactionPreview = () => {
	const { id } = useParams();
	const toast = useToast();

	const { data, isLoading, isError } = useGetTransaction(id as string);

	if (isLoading) {
		return (
			<div className="flex justify-center py-20">Loading transaction...</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="flex justify-center py-20">
				Unable to load transaction.
			</div>
		);
	}

	const date = new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(data.confirmed_at || data.created_at));

	return (
		<div className="max-w-3xl mx-auto pt-10 custom-container pb-20">
			<div>
				<GoBack />
			</div>
			<div className="animate-rise mt-10 rounded-xl bg-primary-20 border border-primary-50 p-4 sm:p-8">
				<div className="flex justify-between items-center mb-8 max-sm:flex-col max-sm:items-start gap-3">
					<h2 className="text-2xl font-semibold">Transaction Details</h2>

					<span className="rounded-full bg-success-50 text-success-600 px-4 py-1 text-sm capitalize">
						{data.status}
					</span>
				</div>

				<div className="space-y-5">
					<Detail label="Transaction ID" value={data.id} />

					<Detail label="Transaction Type" value={data.transaction_type} />

					<Detail
						label="Amount"
						value={`${data.amount} ${data.currency.toUpperCase()}`}
					/>

					<Detail
						label="Network Fee"
						value={`${data.network_fee} ${data.currency.toUpperCase()}`}
					/>

					<Detail label="Currency" value={data.currency.toUpperCase()} />

					<Detail label="Status" value={data.status} />

					<Detail label="Confirmed At" value={date} />

					<div className="border-primary-50 pt-2">
						<p className="text-sm text-neutral-900 mb-2">Transaction Hash</p>

						<div className="flex items-center justify-between gap-3 rounded-lg bg-primary-50 px-4 py-3">
							<p className="truncate text-sm text-neutral-500">
								{data.transaction_hash}
							</p>

							<button
								onClick={() => {
									toast.info("Transaction hash copied to clipboard");
									navigator.clipboard.writeText(data.transaction_hash);
								}}
							>
								<Copy size={18} />
							</button>
						</div>
					</div>

					<Detail label="Wallet ID" value={data.wallet_id} />

					{data.transaction_hash && (
						<div className="flex justify-end">
							<ExplorerLink hash={data.transaction_hash} className="text-sm" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TransactionPreview;

interface DetailProps {
	label: string;
	value: string | number;
}

const Detail = ({ label, value }: DetailProps) => (
	<div className="flex max-sm:flex-col justify-between items-start border-b border-primary-50 pb-4 gap-1 sm:gap-5">
		<p className="text-neutral-900">{label}</p>

		<p className="font-medium  text-right max-sm:text-start break-all">
			{value}
		</p>
	</div>
);
