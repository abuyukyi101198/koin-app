import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { Book } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { useNotebookSelection } from "@/context/notebook-selection-context.tsx";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

export function useNotebookAllCoinsTableColumns(): ColumnDef<Coin>[] {
  const { selectedNotebookId } = useNotebookSelection();

  // Stable columns — no deps, never recreated, images never flicker.
  const stableColumns = useMemo<ColumnDef<Coin>[]>(
    () => [
      {
        id: "images",
        accessorKey: "obverse_image",
        enableSorting: false,
        meta: { size: 20 },
        cell: ({
          row: {
            original: { reverse_image, obverse_image },
          },
        }) => (
          <div className="flex gap-2">
            <div className="h-8 aspect-square flex items-center justify-center">
              {reverse_image ? (
                <img
                  alt="Coin reverse"
                  className="max-w-full max-h-full object-contain rounded-full"
                  src={reverse_image}
                />
              ) : (
                <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                  R
                </div>
              )}
            </div>
            <div className="h-8 aspect-square flex items-center justify-center">
              {obverse_image ? (
                <img
                  alt="Coin obverse"
                  className="max-w-full max-h-full object-contain rounded-full"
                  src={obverse_image}
                />
              ) : (
                <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                  O
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "title",
        accessorKey: "title",
        enableSorting: false,
        meta: { size: 60 },
        cell: ({
          row: {
            original: { title, value, description, issuer },
          },
        }) => (
          <div className="flex flex-col">
            <div className="flex gap-2 w-fit">
              <span className="pt-0.5">
                <img
                  alt={`${issuer.name} flag`}
                  className="h-3 w-4.5"
                  loading="lazy"
                  src={issuer.flag?.length ? issuer.flag : undefined}
                />
              </span>
              <span className="text-xs font-medium">
                {asFraction(title, value)}
              </span>
            </div>
            <span className="text-muted-foreground text-xs italic pl-6.5 truncate w-full">
              {description?.length ? description : "—"}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  // Status column — only recreated when the selected notebook changes.
  const statusColumn = useMemo<ColumnDef<Coin>>(
    () => ({
      id: "notebook_status",
      accessorKey: "notebook_id",
      enableSorting: false,
      meta: { size: 20 },
      cell: ({
        row: {
          original: { notebook_id },
        },
      }) => {
        if (notebook_id == null) return null;

        if (notebook_id === selectedNotebookId) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Book className="size-4 text-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left">In this notebook</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Book className="size-4 text-muted-foreground/40" />
            </TooltipTrigger>
            <TooltipContent side="left">In another notebook</TooltipContent>
          </Tooltip>
        );
      },
    }),
    [selectedNotebookId]
  );

  return useMemo(
    () => [...stableColumns, statusColumn],
    [stableColumns, statusColumn]
  );
}
