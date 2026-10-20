/* eslint-disable react-hooks/incompatible-library */
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { invoiceRoutes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { InvoiceType } from "@/features/invoice/types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  // console.log("table", data);
  const router = useRouter();

  return (
    <div className="">
      <Table>
        <TableHeader className="">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="[&>th:first-child]:rounded-bl-xl [&>th:first-child]:rounded-tl-sm [&>th:last-child]:rounded-br-xl [&>th:last-child]:rounded-tr-sm bg-primary-20"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="font-bold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="hover:bg-primary-500 hover:text-neutral-500 border-t-10 border-neutral-500 cursor-pointer 
               [&>td:first-child]:rounded-bl-xl [&>td:first-child]:rounded-tl-xl [&>td:last-child]:rounded-br-xl [&>td:last-child]:rounded-tr-xl [&>td:first-child]:font-bold"
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => {
                  const getInvoice = data?.find(
                    (_, i) => row.id === i.toString(),
                  ) as InvoiceType | undefined;

                  const invoiceId = getInvoice?.id ?? "";
                  // console.log("invoiceId:", invoiceId);

                  router.push(
                    invoiceRoutes.PREVIEW_INVOICE({
                      invoice_id: invoiceId,
                    }),
                  );
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell className=" bg-primary-20" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="border-t-10 border-neutral-500">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center p-10"
              >
                <p className="text-lg">
                  You have not created any invoice yet. <br /> All latest
                  invoices would be displayed here.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
