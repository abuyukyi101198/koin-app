"use client";

import { ComponentProps, useState, ReactNode } from "react";

import {
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  Updater,
  RowSelectionState,
} from "@tanstack/react-table";
import { LoaderIcon } from "lucide-react";

import { ScrollArea } from "../ui/scroll-area";

import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { cn } from "@/lib/utils.ts";

export interface DataTableProps<
  TData extends { id: number | string },
> extends ComponentProps<"table"> {
  data: TData[];
  columns: ColumnDef<TData>[];
  loading: boolean;
  selection?: {
    rowSelection: RowSelectionState;
    onRowSelectionChange: (updaterOrValue: Updater<RowSelectionState>) => void;
  };
  sort?: {
    sorting: SortingState;
    onSortingChange: (updaterOrValue: Updater<SortingState>) => void;
  };
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPaginationChange: (pageIndex: number, pageSize: number) => Promise<void>;
  };
  empty?: ReactNode;
  header?: boolean;
}

export function DataTable<TData extends { id: number | string }>({
  data,
  columns,
  loading,
  selection,
  sort,
  pagination,
  empty,
  header = true,
  ...props
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Calculate total size and percentage widths
  const getMeta = (col: ColumnDef<TData>) =>
    (col.meta as { size?: number; responsiveClass?: string }) || {};

  const totalSize = columns.reduce(
    (sum, col) => sum + (getMeta(col).size || 100),
    0
  );

  const getColumnWidth = (columnSize: number | undefined) => {
    const size = columnSize || 100;
    return Math.round((size / totalSize) * 10000) / 100; // 2 decimal precision
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: sort?.onSortingChange,
    getSortedRowModel: sort ? getSortedRowModel() : undefined,
    getRowId: (originalRow) => originalRow.id.toString(),
    onRowSelectionChange: selection?.onRowSelectionChange,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting: sort?.sorting || [],
      columnVisibility,
      rowSelection: selection?.rowSelection,
    },
    manualSorting: true,
  });

  return (
    <>
      <div
        className={cn("h-full overflow-x-auto overflow-hidden", {
          "max-h-[calc(100%-57px)]": header,
          "max-h-full": !header,
        })}
      >
        {header && (
          <Table {...props} className={cn("table-fixed", props.className)}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="hover:bg-background" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = getMeta(header.column.columnDef);
                    const widthPercent = getColumnWidth(meta.size);
                    const responsiveClass = meta.responsiveClass || "";

                    return (
                      <TableHead
                        className={`px-6 ${responsiveClass} text-muted-foreground`}
                        key={header.id}
                        style={{ width: `${widthPercent}%` }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          </Table>
        )}
        <ScrollArea
          className={cn("h-full w-full", { "max-h-[calc(100%-41px)]": header })}
        >
          <Table {...props} className={cn("table-fixed", props.className)}>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="cursor-pointer max-w-full"
                    key={row.id}
                    onClick={() => {
                      table.setRowSelection({
                        [row.id]: !row.getIsSelected(),
                      });
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = getMeta(cell.column.columnDef);
                      const widthPercent = getColumnWidth(meta.size);
                      const responsiveClass = meta.responsiveClass || "";

                      return (
                        <TableCell
                          className={`px-6 ${responsiveClass}`}
                          key={cell.id}
                          style={{ width: `${widthPercent}%` }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : loading ? (
                <TableRow className="hover:bg-background">
                  <TableCell className="h-12" colSpan={columns.length}>
                    <div className="flex items-center justify-center h-full">
                      <LoaderIcon
                        aria-label="Loading"
                        className="size-4 animate-spin"
                        role="status"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="hover:bg-background">
                  <TableCell
                    className="h-12 text-center"
                    colSpan={columns.length}
                  >
                    {empty ?? "No results."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      {pagination && (
        <DataTablePagination
          onPaginationChange={pagination.onPaginationChange}
          pageCount={pagination.pageCount}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
        />
      )}
    </>
  );
}
