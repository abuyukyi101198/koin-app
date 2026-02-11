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
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        className="data-[state=open]:bg-accent -ml-3 h-8"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === "asc");
        }}
        size="sm"
        variant="ghost"
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ChevronUp />
        ) : column.getIsSorted() === "asc" ? (
          <ChevronDown />
        ) : (
          <ChevronsUpDown className="text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
