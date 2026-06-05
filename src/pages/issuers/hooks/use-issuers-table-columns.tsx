import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon } from "lucide-react";

import { DataTableColumnHeader } from "@/components/composite/data-table-column-header.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Issuer } from "@/query/types";

export function useIssuersTableColumns(): ColumnDef<Issuer>[] {
  return useMemo(
    () =>
      [
        {
          id: "issuer",
          accessorKey: "issuer",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Issuer" />
          ),
          meta: {
            size: 80,
            className: "md:table-cell hidden",
            skeleton: () => (
              <div className="flex items-center gap-2 ml-2">
                <Skeleton className="size-3 shrink-0 rounded" />
                <Skeleton className="h-4 w-6.5 shrink-0 rounded" />
                <Skeleton className="h-3 flex-1 rounded" />
              </div>
            ),
          },
          cell: ({ row }) => {
            const { name, flag, start_year, end_year } = row.original;
            const canExpand = row.getCanExpand();
            const isExpanded = row.getIsExpanded();

            return (
              <div
                className="ml-2 w-full flex items-center gap-2"
                style={
                  row.depth > 0
                    ? { paddingLeft: `${row.depth * 1.5}rem` }
                    : undefined
                }
              >
                <div>
                  <div className="flex gap-2">
                    {canExpand ? (
                      <ChevronRightIcon
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 size-3 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    ) : (
                      <span aria-hidden="true" className="size-3 shrink-0" />
                    )}
                    <img
                      alt={`${name} flag`}
                      className="h-4 w-6.5 shrink-0 mt-0.5"
                      loading="lazy"
                      src={flag?.length ? flag : undefined}
                    />
                    <span className="font-serif font-medium">{name}</span>
                  </div>
                  {name !== "Other" && (
                    <span
                      aria-label={`Years of issue: ${start_year} to ${end_year ? end_year : "present"}`}
                      className="pl-14 text-xs italic text-muted-foreground text-right leading-5"
                    >
                      ({start_year}-{end_year ?? "pres."})
                    </span>
                  )}
                </div>
              </div>
            );
          },
        },
      ] as ColumnDef<Issuer>[],
    []
  );
}
