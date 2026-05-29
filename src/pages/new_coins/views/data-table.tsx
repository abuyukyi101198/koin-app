import { CSSProperties, ComponentProps, ReactNode, useState } from "react";

import {
  ColumnDef,
  RowData,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue = unknown> {
    size?: number;
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
    skeleton?: () => ReactNode;
  }
}

export interface DataTableProps<
  TData extends { id: number | string },
> extends Omit<ComponentProps<"table">, "children"> {
  data: TData[];
  columns: ColumnDef<TData>[];
  loading?: boolean;
  selection?: {
    rowSelection: RowSelectionState;
    onRowSelectionChange: (updaterOrValue: Updater<RowSelectionState>) => void;
  };
  sort?: {
    sorting: SortingState;
    onSortingChange: (updaterOrValue: Updater<SortingState>) => void;
  };
  empty?: ReactNode;
  showHeader?: boolean;
  /** Number of skeleton rows shown during initial load. Defaults to 10. */
  skeletonRowCount?: number;
}

function proportionalWidth(size: number, total: number): CSSProperties {
  return { width: `${Math.round((size / total) * 10000) / 100}%` };
}

export function DataTable<TData extends { id: number | string }>({
  data,
  columns,
  loading = false,
  selection,
  sort,
  empty,
  showHeader = true,
  skeletonRowCount = 25,
  className,
  ...tableProps
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const totalSize = columns.reduce(
    (sum, col) => sum + (col.meta?.size ?? 100),
    0
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sort ? getSortedRowModel() : undefined,
    getRowId: (row) => row.id.toString(),
    onSortingChange: sort?.onSortingChange,
    onRowSelectionChange: selection?.onRowSelectionChange,
    onColumnVisibilityChange: setColumnVisibility,
    manualSorting: true,
    state: {
      sorting: sort?.sorting ?? [],
      columnVisibility,
      rowSelection: selection?.rowSelection ?? {},
    },
  });

  return (
    <div
      aria-busy={loading}
      aria-label="Data table"
      className="flex-1 min-h-0 w-full flex flex-col overflow-hidden"
      role="table"
    >
      {showHeader && (
        <div
          className={cn(
            "shrink-0 pr-2.5 z-10 bg-background",
            "[box-shadow:inset_0_-1px_0_0_var(--color-border)]"
          )}
        >
          <table className={cn("w-full table-fixed text-sm")} role="rowheader">
            <TableHeader className="[&_tr]:border-0">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  aria-rowindex={1}
                  className="hover:bg-background gap-12"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta;
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
                          "text-muted-foreground",
                          isSortable && "cursor-pointer select-none",
                          meta?.className,
                          meta?.headerClassName
                        )}
                        key={header.id}
                        role="columnheader"
                        scope="col"
                        style={proportionalWidth(meta?.size ?? 100, totalSize)}
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
          </table>
        </div>
      )}
      <div
        className={cn(
          "flex-1 min-h-0 overflow-x-auto overflow-y-scroll",
          "[&::-webkit-scrollbar]:w-2.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:border",
          "[&::-webkit-scrollbar-thumb]:border-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-thumb]:bg-clip-content"
        )}
      >
        <table
          className={cn("w-full table-fixed caption-bottom text-sm", className)}
          role="rowgroup"
          {...tableProps}
        >
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  aria-rowindex={rowIndex + (showHeader ? 2 : 1)}
                  aria-selected={row.getIsSelected()}
                  className="gap-12 group hover:bg-muted! data-[state=selected]:bg-accent/50! cursor-pointer"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  key={row.id}
                  onClick={() => {
                    table.setRowSelection({ [row.id]: !row.getIsSelected() });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      table.setRowSelection({ [row.id]: !row.getIsSelected() });
                    }
                  }}
                  role="row"
                  tabIndex={0}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const meta = cell.column.columnDef.meta;
                    return (
                      <TableCell
                        aria-colindex={cellIndex + 1}
                        className={cn(meta?.className, meta?.cellClassName, {
                          "relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-0.75 before:bg-transparent before:transition-colors group-data-[state=selected]:before:bg-primary":
                            cellIndex === 0,
                          "rounded-l-lg": cellIndex === 0,
                          "rounded-r-lg":
                            cellIndex === row.getVisibleCells().length - 1,
                        })}
                        key={cell.id}
                        role="gridcell"
                        style={proportionalWidth(meta?.size ?? 100, totalSize)}
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
              (() => {
                const headers = table.getHeaderGroups()[0]?.headers ?? [];
                return Array.from({ length: skeletonRowCount }).map(
                  (_, rowIndex) => (
                    <TableRow
                      className="hover:bg-transparent"
                      key={`skel-${rowIndex}`}
                    >
                      {headers.map((header, cellIndex) => {
                        const meta = header.column.columnDef.meta;
                        return (
                          <TableCell
                            className={cn(
                              meta?.className,
                              meta?.cellClassName,
                              {
                                "rounded-l-lg": cellIndex === 0,
                                "rounded-r-lg":
                                  cellIndex === headers.length - 1,
                              }
                            )}
                            key={`skel-${rowIndex}-${header.id}`}
                            style={proportionalWidth(
                              meta?.size ?? 100,
                              totalSize
                            )}
                          >
                            {meta?.skeleton ? (
                              meta.skeleton()
                            ) : (
                              <Skeleton className="h-4 w-full rounded" />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )
                );
              })()
            ) : (
              <TableRow className="hover:bg-background">
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                  role="gridcell"
                >
                  <div aria-live="polite" role="status">
                    {empty ?? (
                      <p className="text-muted-foreground text-sm">
                        No results found.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
