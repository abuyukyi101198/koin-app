import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { Book } from "lucide-react";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
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
            original: { title, reverse_image, obverse_image },
          },
        }) => (
          <div className="flex gap-1">
            <CoinPreviewImages
              obverseImage={obverse_image}
              reverseImage={reverse_image}
              size="size-8"
              title={title}
            />
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
            <div className="h-8 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Book className="size-3 text-foreground" />
                </TooltipTrigger>
                <TooltipContent side="left">In this notebook</TooltipContent>
              </Tooltip>
            </div>
          );
        }

        return (
          <div className="h-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <Book className="size-3 text-muted-foreground/40" />
              </TooltipTrigger>
              <TooltipContent side="left">In another notebook</TooltipContent>
            </Tooltip>
          </div>
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
