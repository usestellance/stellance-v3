import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@repo/ui/pagination";
import { useTransactionFilter } from "@/features/transactions/store";

const TransactionPagination = ({ pageNumber }: { pageNumber: number }) => {
	const { page, setPage } = useTransactionFilter();

	const isFirstPage = page <= 1;
	const isLastPage = page >= pageNumber;

	return (
		<Pagination>
			<PaginationContent className="flex w-full justify-between">
				<PaginationItem>
					<PaginationPrevious
						onClick={() => {
							if (!isFirstPage) {
								setPage(page - 1);
							}
						}}
						className={`bg-neutral-comment ${
							isFirstPage
								? "pointer-events-none cursor-not-allowed opacity-50"
								: "text-primary-500"
						}`}
					/>
				</PaginationItem>

				<PaginationItem>
					<div className="text-xs font-medium md:text-sm">
						Page {page} of {pageNumber}
					</div>
				</PaginationItem>

				<PaginationItem>
					<PaginationNext
						onClick={() => {
							if (!isLastPage) {
								setPage(page + 1);
							}
						}}
						className={`bg-neutral-comment ${
							isLastPage
								? "pointer-events-none cursor-not-allowed opacity-50"
								: "text-primary-500"
						}`}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};

export default TransactionPagination;
