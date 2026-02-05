"use client";

import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  ColumnsSettingsIcon,
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
  // Search configuration
  search?: {
    enabled: boolean;
    columnId: string;
    placeholder?: string;
  };
  // Column visibility configuration
  columnToggle?: {
    enabled: boolean;
    excludeColumns?: string[];
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
  columnToggle,
  pagination,
  headerActions,
  empty,
  ...props
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full p-4">
      {(search?.enabled ||
        columnToggle?.enabled ||
        headerActions ||
        pagination?.enabled) && (
        <div className="w-full flex items-center justify-between py-3.5 gap-2.5">
          {search?.enabled && (
            <Input
              placeholder={search.placeholder || "Search..."}
              value={
                (table
                  .getColumn(search.columnId)
                  ?.getFilterValue() as string) || ""
              }
              onChange={(event) =>
                table
                  .getColumn(search.columnId)
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-full"
            />
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            {columnToggle?.enabled && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ColumnsSettingsIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        column.getCanHide() &&
                        !columnToggle.excludeColumns?.includes(column.id)
                    )
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <LoaderIcon
                    role="status"
                    aria-label="Loading"
                    className="size-4 animate-spin"
                  />
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
