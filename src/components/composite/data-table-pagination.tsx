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
  const [sizeSelectOpen, setSizeSelectOpen] = useState<boolean>(false);

  return (
    <div className="relative flex justify-center items-center px-4 py-3 border-t">
      <div className="flex justify-center items-center space-x-2">
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
          className="w-fit absolute right-4 cursor-pointer focus-visible:ring-0 text-xs"
          size="sm"
        >
          <SelectValue />
        </SelectTrigger>
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
    </div>
  );
}
