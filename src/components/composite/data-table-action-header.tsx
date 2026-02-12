import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { DataTableProps } from "@/components/composite/data-table.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

interface DataTableActionHeaderProps<TData extends { id: number | string }> {
  search?: DataTableProps<TData>["search"];
  pagination?: DataTableProps<TData>["pagination"];
  actions?: DataTableProps<TData>["actions"];
}

export function DataTableActionHeader<TData extends { id: number | string }>({
  search,
  pagination,
  actions,
}: DataTableActionHeaderProps<TData>) {
  return (
    <div className="w-full flex items-center justify-between pb-3.5 gap-2.5">
      {search && (
        <Input
          className="max-w-full"
          onChange={(event) => {
            search.onChange(event.target.value);
          }}
          placeholder={search.placeholder || "Search..."}
          value={search.value}
        />
      )}

      <div className="flex items-center gap-2.5 ml-auto">
        {actions && <div>{actions}</div>}

        {pagination && (
          <div className="flex items-center space-x-2">
            <Button
              className="hidden size-8 lg:flex"
              disabled={pagination.pageIndex === 1}
              onClick={() =>
                pagination.onPaginationChange(1, pagination.pageSize)
              }
              size="icon"
              variant="outline"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              className="size-8"
              disabled={pagination.pageIndex === 1}
              onClick={() =>
                pagination.onPaginationChange(
                  pagination.pageIndex - 1,
                  pagination.pageSize
                )
              }
              size="icon"
              variant="outline"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <div className="flex w-25 items-center justify-center text-sm font-medium">
              Page {pagination.pageIndex} of{" "}
              {pagination.pageCount ? pagination.pageCount : 1}
            </div>
            <Button
              className="size-8"
              disabled={pagination.pageIndex >= pagination.pageCount - 1}
              onClick={() =>
                pagination.onPaginationChange(
                  pagination.pageIndex + 1,
                  pagination.pageSize
                )
              }
              size="icon"
              variant="outline"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              className="hidden size-8 lg:flex"
              disabled={pagination.pageIndex >= pagination.pageCount - 1}
              onClick={() =>
                pagination.onPaginationChange(
                  pagination.pageCount - 1,
                  pagination.pageSize
                )
              }
              size="icon"
              variant="outline"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
