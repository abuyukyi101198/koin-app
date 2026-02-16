import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button.tsx";

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPaginationChange: (pageIndex: number, pageSize: number) => Promise<void>;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex justify-center items-center space-x-2 py-3 border-t">
      <Button
        className="hidden size-8 lg:flex cursor-pointer"
        disabled={pageIndex === 1}
        onClick={() => onPaginationChange(1, pageSize)}
        size="icon"
        variant="outline"
      >
        <span className="sr-only">Go to first page</span>
        <ChevronsLeft />
      </Button>
      <Button
        className="size-8 cursor-pointer"
        disabled={pageIndex === 1}
        onClick={() => onPaginationChange(pageIndex - 1, pageSize)}
        size="icon"
        variant="outline"
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeft />
      </Button>
      <div className="flex w-25 items-center justify-center text-xs font-medium">
        Page {pageIndex} of {pageCount ? pageCount : 1}
      </div>
      <Button
        className="size-8 cursor-pointer"
        disabled={pageIndex >= pageCount}
        onClick={() => onPaginationChange(pageIndex + 1, pageSize)}
        size="icon"
        variant="outline"
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRight />
      </Button>
      <Button
        className="hidden size-8 lg:flex cursor-pointer"
        disabled={pageIndex >= pageCount}
        onClick={() => onPaginationChange(pageCount, pageSize)}
        size="icon"
        variant="outline"
      >
        <span className="sr-only">Go to last page</span>
        <ChevronsRight />
      </Button>
    </div>
  );
}
