import { useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize?: number;
  pageCount: number;
  onPaginationChange: (pageIndex: number, pageSize: number) => Promise<void>;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
}: DataTablePaginationProps) {
  const [sizeSelectOpen, setSizeSelectOpen] = useState<boolean>(false);
  const isFirstPage = pageIndex === 1;
  const isLastPage = pageIndex >= pageCount;

  return (
    <nav
      aria-label="Pagination navigation"
      className="relative flex justify-center items-center h-14 px-4 py-3 border-t"
    >
      <div className="flex justify-center items-center space-x-2">
        <Button
          aria-disabled={isFirstPage}
          aria-label="Go to first page"
          className="hidden size-8 lg:flex cursor-pointer"
          disabled={isFirstPage}
          onClick={() => onPaginationChange(1, pageSize ?? 0)}
          size="icon"
          title={isFirstPage ? "You are on the first page" : "Go to first page"}
          variant="outline"
        >
          <ChevronsLeft aria-hidden="true" className="size-4" />
        </Button>
        <Button
          aria-disabled={isFirstPage}
          aria-label="Go to previous page"
          className="size-8 cursor-pointer"
          disabled={isFirstPage}
          onClick={() => onPaginationChange(pageIndex - 1, pageSize ?? 0)}
          size="icon"
          title={
            isFirstPage ? "You are on the first page" : "Go to previous page"
          }
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Button>

        <div
          aria-current="page"
          className="flex w-25 items-center justify-center text-xs font-medium"
        >
          Page <span className="mx-1 font-semibold">{pageIndex}</span> of
          <span className="ml-1 font-semibold">
            {pageCount ? pageCount : 1}
          </span>
        </div>

        <Button
          aria-disabled={isLastPage}
          aria-label="Go to next page"
          className="size-8 cursor-pointer"
          disabled={isLastPage}
          onClick={() => onPaginationChange(pageIndex + 1, pageSize ?? 0)}
          size="icon"
          title={isLastPage ? "You are on the last page" : "Go to next page"}
          variant="outline"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
        <Button
          aria-disabled={isLastPage}
          aria-label="Go to last page"
          className="hidden size-8 lg:flex cursor-pointer"
          disabled={isLastPage}
          onClick={() => onPaginationChange(pageCount, pageSize ?? 0)}
          size="icon"
          title={isLastPage ? "You are on the last page" : "Go to last page"}
          variant="outline"
        >
          <ChevronsRight aria-hidden="true" className="size-4" />
        </Button>
      </div>

      {pageSize && (
        <Select
          onOpenChange={(open) => {
            setSizeSelectOpen(open);
          }}
          onValueChange={(value) => {
            onPaginationChange(pageIndex, Number.parseInt(value)).then(() => {
              setSizeSelectOpen(false);
            });
          }}
          open={sizeSelectOpen}
          value={pageSize.toString()}
        >
          <SelectTrigger
            aria-describedby="page-size-help"
            aria-label="Rows per page"
            className="w-fit absolute right-4 cursor-pointer focus-visible:ring-0 text-xs"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <span className="sr-only" id="page-size-help">
            Select how many rows to display per page
          </span>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem className="text-xs cursor-pointer" value="10">
                10 / page
              </SelectItem>
              <SelectItem className="text-xs cursor-pointer" value="25">
                25 / page
              </SelectItem>
              <SelectItem className="text-xs cursor-pointer" value="50">
                50 / page
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </nav>
  );
}
