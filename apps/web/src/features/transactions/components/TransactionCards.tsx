import {
	LucideArrowDownToLine,
	LucideArrowUpToLine,
	LucideClock3,
	LucideCircleCheck,
	LucideCircleX,
} from "lucide-react";
import { FC } from "react";
import { ITransaction, formatTokenAmount, isIncoming } from "@/features/transactions/types";
import Link from "next/link";
import { transactionsRoutes } from "@/lib/routes";

const TransactionCards: FC<ITransaction> = ({
	amount,
	currency,
	transaction_hash,
	transaction_type,
	confirmed_at,
	created_at,
	status,
	network_fee,
	id,
}) => {
	const isFunding = isIncoming({ transaction_type });
	const failed = status === "failed";

	const date = new Date(confirmed_at || created_at).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});

	const shortHash = `${transaction_hash.slice(
		0,
		8,
	)}...${transaction_hash.slice(-8)}`;

	const statusStyles = {
		confirmed: "text-success-500 bg-success-50",
		pending: "text-warning-600 bg-warning-50",
		failed: "text-error-500 bg-error-50",
	};

	const statusIcon = {
		confirmed: <LucideCircleCheck size={14} />,
		pending: <LucideClock3 size={14} />,
		failed: <LucideCircleX size={14} />,
	};

	return (
		<Link
			href={transactionsRoutes.TRANSACTION(id)}
			className="block rounded-xl bg-primary-20 p-4 sm:p-5 lg:p-6 border border-primary-50/60 transition-colors hover:bg-primary-50 duration-150"
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				{/* Left */}
				<div className="flex gap-3 min-w-0">
					<div
						className={`${
							isFunding ? "bg-success-500" : "bg-error-500"
						} h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-neutral-500 shrink-0`}
					>
						{isFunding ? (
							<LucideArrowDownToLine size={20} className="sm:size-[22px]" />
						) : (
							<LucideArrowUpToLine size={20} className="sm:size-[22px]" />
						)}
					</div>

					<div className="min-w-0">
						<h4 className="font-semibold text-base lg:text-lg capitalize leading-tight text-primary-600">
							{transaction_type}
						</h4>

						<p className="text-sm text-neutral-900 mt-1">{date}</p>

						<p className="text-xs text-neutral-800 truncate mt-2 font-mono">
							{shortHash}
						</p>
					</div>
				</div>

				{/* Right */}
				<div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2 sm:text-right sm:shrink-0">
					<h3
						className={`font-bold text-lg sm:text-xl lg:text-2xl whitespace-nowrap ${
							failed ? "text-neutral-900 line-through" : isFunding ? "text-success-500" : "text-error-500"
						}`}
					>
						{failed ? "" : isFunding ? "+" : "-"}
						{formatTokenAmount(amount, currency)}
					</h3>

					<div
						className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status]}`}
					>
						{statusIcon[status]}
						<span className="capitalize">{status}</span>
					</div>
				</div>
			</div>

			{network_fee != null && (
				<div className="mt-4 border-t border-primary-50 pt-3 flex items-center justify-between text-sm text-neutral-900">
					<span>Network Fee</span>

					<span className="font-medium text-primary-600">
						{network_fee} {currency.toUpperCase()}
					</span>
				</div>
			)}
		</Link>
	);
};

export default TransactionCards;
