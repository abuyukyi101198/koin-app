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

import { DataTableActionHeader } from "@/components/composite/data-table-action-header.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

export interface DataTableProps<
  TData extends { id: number | string },
> extends ComponentProps<"table"> {
  data: TData[];
  columns: ColumnDef<TData>[];
  loading: boolean;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
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
  actions?: ReactNode;
  empty?: ReactNode;
}

export function DataTable<TData extends { id: number | string }>({
  data,
  columns,
  loading,
  search,
  selection,
  sort,
  pagination,
  actions,
  empty,
  ...props
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

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
    <div className="w-full">
      {(search || actions || pagination) && (
        <DataTableActionHeader
          actions={actions}
          pagination={pagination}
          search={search}
        />
      )}
      <div className="overflow-hidden">
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
                  className="cursor-pointer"
                  key={row.id}
                  onClick={() => {
                    table.setRowSelection({
                      [row.id]: !row.getIsSelected(),
                    });
                  }}
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
