import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { Notebook } from "@/query/types/notebooks.ts";
import { truncate } from "@/utils/truncate.ts";

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
            const limit = 40;

            return (
              <div className="w-full flex flex-col justify-between">
                <span title={title.length > limit ? title : undefined}>
                  {truncate(title, limit)}
                </span>
                {description && (
                  <span
                    className="text-xs italic text-muted-foreground leading-5 grow"
                    title={description.length > limit ? description : undefined}
                  >
                    {truncate(description, limit)}
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
