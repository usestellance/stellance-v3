import {
  Pagination,
  PaginationContent,
  //   PaginationEllipsis,
  PaginationItem,
  //   PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/pagination";
import { useInvoiceFilter } from "@/features/invoice/store";

const InvoicePagination = ({ pageNumber }: { pageNumber: number }) => {
  const { page, setPage } = useInvoiceFilter();

  const isFirstPage = page <= 1;
  const isLastPage = page >= pageNumber;

  return (
    <Pagination>
      <PaginationContent className="w-full flex justify-between">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => {
              if (!isFirstPage) setPage(page - 1);
            }}
            className={`bg-neutral-comment ${
              isFirstPage
                ? "pointer-events-none opacity-50 cursor-not-allowed"
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
              if (!isLastPage) setPage(page + 1);
            }}
            className={`bg-neutral-comment ${
              isLastPage
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : "text-primary-500"
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default InvoicePagination;
