import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { Notebook } from "@/query/types/notebooks.ts";

export function useNotebooksTableColumns(): ColumnDef<Notebook>[] {
  return useMemo(
    () =>
      [
        {
          id: "title",
          accessorKey: "title",
          enableSorting: false,
          meta: {
            size: 60,
          },
          cell: ({
            row: {
              original: { title, description },
            },
          }) => {
            return (
              <div className="w-full flex flex-col justify-between">
                <span className="text-left truncate">{title}</span>
                {description && (
                  <span className="text-left text-xs italic text-muted-foreground leading-5 grow truncate">
                    {description}
                  </span>
                )}
              </div>
            );
          },
        },
      ] as ColumnDef<Notebook>[],
    []
  );
}
