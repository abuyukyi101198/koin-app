import { HTMLAttributes } from "react";

import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  align?: "center" | "left" | "right";
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  align = "left",
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
        "w-full data-[state=open]:bg-accent h-8 cursor-pointer text-muted-foreground px-0!",
        {
          "justify-start": align === "left",
          "justify-end": align === "right",
          "justify-center": align === "center",
        }
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
        <ChevronUp aria-hidden="true" />
      ) : sortState === "asc" ? (
        <ChevronDown aria-hidden="true" />
      ) : // <ChevronsUpDown aria-hidden="true" className="text-muted-foreground" />
      null}
    </Button>
  );
}
