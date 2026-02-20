import { HTMLAttributes } from "react";

import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn(className)} role="columnheader">
        {title}
      </div>
    );
  }

  const sortState = column.getIsSorted();
  const ariaSort =
    sortState === "asc"
      ? "ascending"
      : sortState === "desc"
        ? "descending"
        : "none";

  return (
    <Button
      aria-sort={ariaSort}
      className={cn(
        className,
        "data-[state=open]:bg-accent h-8 cursor-pointer text-muted-foreground px-0!"
      )}
      onClick={() => {
        column.toggleSorting(column.getIsSorted() === "asc");
      }}
      role="columnheader"
      size="sm"
      variant="link"
    >
      <span>{title}</span>
      {sortState === "desc" ? (
        <ChevronUp aria-hidden="true" className="ml-2" />
      ) : sortState === "asc" ? (
        <ChevronDown aria-hidden="true" className="ml-2" />
      ) : (
        <ChevronsUpDown
          aria-hidden="true"
          className="ml-2 text-muted-foreground"
        />
      )}
    </Button>
  );
}
