"use client";

import {
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  Updater,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { ComponentProps, useState, ReactNode } from "react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  LoaderIcon,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

interface DataTableProps<TData> extends ComponentProps<"table"> {
  data: TData[];
  columns: ColumnDef<TData>[];
  loading: boolean;
  // Search state - controlled from parent
  search?: {
    enabled: boolean;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  // Sort configuration
  sort?: {
    enabled: boolean;
    sorting: SortingState;
    onSortingChange: (updaterOrValue: Updater<SortingState>) => void;
  };
  // Pagination configuration matching React Table
  pagination?: {
    enabled: boolean;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPaginationChange: (pageIndex: number, pageSize: number) => Promise<void>;
  };
  headerActions?: ReactNode;
  empty?: ReactNode;
}

export function DataTable<TData>({
  data,
  columns,
  loading,
  search,
  sort,
  pagination,
  headerActions,
  empty,
  ...props
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: sort?.onSortingChange,
    getSortedRowModel: sort?.enabled ? getSortedRowModel() : undefined,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting: sort?.sorting || [],
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full p-4">
      {(search?.enabled || headerActions || pagination?.enabled) && (
        <div className="w-full flex items-center justify-between py-3.5 gap-2.5">
          {search?.enabled && (
            <Input
              placeholder={search.placeholder || "Search..."}
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              className="max-w-full"
            />
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            {headerActions && <div>{headerActions}</div>}

            {pagination?.enabled && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden size-8 lg:flex"
                  onClick={() =>
                    pagination.onPaginationChange(0, pagination.pageSize)
                  }
                  disabled={pagination.pageIndex === 0}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() =>
                    pagination.onPaginationChange(
                      pagination.pageIndex - 1,
                      pagination.pageSize
                    )
                  }
                  disabled={pagination.pageIndex === 0}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft />
                </Button>
                <div className="flex w-25 items-center justify-center text-sm font-medium">
                  Page {pagination.pageIndex + 1} of {pagination.pageCount}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() =>
                    pagination.onPaginationChange(
                      pagination.pageIndex + 1,
                      pagination.pageSize
                    )
                  }
                  disabled={pagination.pageIndex >= pagination.pageCount - 1}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden size-8 lg:flex"
                  onClick={() =>
                    pagination.onPaginationChange(
                      pagination.pageCount - 1,
                      pagination.pageSize
                    )
                  }
                  disabled={pagination.pageIndex >= pagination.pageCount - 1}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table {...props}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex items-center justify-center h-full">
                    <LoaderIcon
                      role="status"
                      aria-label="Loading"
                      className="size-4 animate-spin"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {empty ? empty : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
