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
} from "@tanstack/react-table";
import { LoaderIcon } from "lucide-react";

import { DataTableActionHeader } from "@/components/composite/data-table-action-header.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

export interface DataTableProps<TData> extends ComponentProps<"table"> {
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
  actions?: ReactNode;
  empty?: ReactNode;
}

export function DataTable<TData>({
  data,
  columns,
  loading,
  search,
  sort,
  pagination,
  actions,
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
    manualSorting: true,
  });

  return (
    <div className="w-full p-4">
      {(search?.enabled || actions || pagination?.enabled) && (
        <DataTableActionHeader
          actions={actions}
          pagination={pagination}
          search={search}
        />
      )}
      <div className="overflow-hidden rounded-md border">
        <Table {...props}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="px-6" key={header.id}>
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
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-6" key={cell.id}>
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
                <TableCell className="h-24" colSpan={columns.length}>
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
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
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
