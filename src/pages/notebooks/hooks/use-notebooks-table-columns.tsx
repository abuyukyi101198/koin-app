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
            const displayTitle =
              title.length > 40
                ? `${title.substring(0, 40).trimEnd()}...`
                : title;

            const displayDescription =
              description && description.length > 40
                ? `${description.substring(0, 40).trimEnd()}...`
                : description;

            return (
              <div className="w-full flex flex-col justify-between">
                <span title={title.length > 40 ? title : undefined}>
                  {displayTitle}
                </span>
                {description && (
                  <span
                    className="text-xs italic text-muted-foreground leading-5 grow"
                    title={description.length > 40 ? description : undefined}
                  >
                    {displayDescription}
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
