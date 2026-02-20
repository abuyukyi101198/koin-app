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
        aria-busy={loading}
        className={cn("h-full overflow-x-auto overflow-hidden", {
          "max-h-[calc(100%-57px)]": header,
          "max-h-full": !header,
        })}
        role="region"
      >
        {header && (
          <Table {...props} className={cn("table-fixed", props.className)}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  aria-rowindex={1}
                  className="hover:bg-background"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    const meta = getMeta(header.column.columnDef);
                    const widthPercent = getColumnWidth(meta.size);
                    const responsiveClass = meta.responsiveClass || "";
                    const isSortable = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();

                    return (
                      <TableHead
                        aria-colindex={header.index + 1}
                        aria-sort={
                          sortState === "asc"
                            ? "ascending"
                            : sortState === "desc"
                              ? "descending"
                              : isSortable
                                ? "none"
                                : undefined
                        }
                        className={cn(
                          `px-6 ${responsiveClass} text-muted-foreground`,
                          isSortable && "cursor-pointer select-none"
                        )}
                        key={header.id}
                        role="columnheader"
                        scope="col"
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
                table.getRowModel().rows.map((row, rowIndex) => (
                  <TableRow
                    aria-rowindex={rowIndex + (header ? 2 : 1)}
                    aria-selected={row.getIsSelected()}
                    className="cursor-pointer max-w-full"
                    key={row.id}
                    onClick={() => {
                      table.setRowSelection({
                        [row.id]: !row.getIsSelected(),
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        table.setRowSelection({
                          [row.id]: !row.getIsSelected(),
                        });
                      }
                    }}
                    role="row"
                    tabIndex={0}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const meta = getMeta(cell.column.columnDef);
                      const widthPercent = getColumnWidth(meta.size);
                      const responsiveClass = meta.responsiveClass || "";

                      return (
                        <TableCell
                          aria-colindex={cellIndex + 1}
                          className={cn(`px-6 ${responsiveClass}`)}
                          key={cell.id}
                          role="cell"
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
                  <TableCell
                    aria-colindex={1}
                    className="h-12"
                    colSpan={columns.length}
                    role="cell"
                  >
                    <div
                      className="flex items-center justify-center h-full"
                      role="status"
                    >
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow className="hover:bg-background">
                  <TableCell
                    aria-colindex={1}
                    className="h-12 text-center"
                    colSpan={columns.length}
                    role="cell"
                  >
                    <div aria-live="polite" role="status">
                      {empty ?? (
                        <p className="text-muted-foreground">
                          No results found.
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {pagination && (
        <div aria-atomic="true" aria-live="polite">
          <DataTablePagination
            onPaginationChange={pagination.onPaginationChange}
            pageCount={pagination.pageCount}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
          />
        </div>
      )}
    </>
  );
}
