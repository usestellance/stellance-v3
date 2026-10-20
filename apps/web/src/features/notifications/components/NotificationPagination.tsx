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
import { useVariableStore } from "@/features/notifications/store";

const NotificationPagination = ({ pageNumber }: { pageNumber: number }) => {
  const { notificationsPage, setNotificationsPage } = useVariableStore();

  const isFirstPage = notificationsPage <= 1;
  const isLastPage = notificationsPage >= pageNumber;

  return (
    <Pagination>
      <PaginationContent className="w-full flex justify-between">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => {
              if (!isFirstPage) setNotificationsPage(notificationsPage - 1);
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
            Page {notificationsPage} of {pageNumber}
          </div>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            onClick={() => {
              if (!isLastPage) setNotificationsPage(notificationsPage + 1);
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

export default NotificationPagination;
