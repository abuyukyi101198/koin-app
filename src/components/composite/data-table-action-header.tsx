import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { DataTableProps } from "@/components/composite/data-table.tsx";

interface DataTableActionHeaderProps<TData> {
  search?: DataTableProps<TData>["search"];
  pagination?: DataTableProps<TData>["pagination"];
  actions?: DataTableProps<TData>["actions"];
}

export function DataTableActionHeader<TData>({
  search,
  pagination,
  actions,
}: DataTableActionHeaderProps<TData>) {
  return (
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
        {actions && <div>{actions}</div>}

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
  );
}
