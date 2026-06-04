import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { Book } from "lucide-react";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
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
        id: "title",
        accessorKey: "title",
        enableSorting: false,
        meta: {
          size: 60,
          skeleton: () => (
            <div className="flex flex-row gap-2">
              <div className="flex gap-1">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <Skeleton className="size-8 rounded-full shrink-0" />
              </div>
              <div className="w-full flex flex-col gap-1.5">
                <div className="flex items-start gap-2">
                  <Skeleton className="h-3 w-4.5 shrink-0 rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
                <Skeleton className="ml-6.5 h-3 w-1/2 rounded" />
              </div>
            </div>
          ),
        },
        cell: ({
          row: {
            original: {
              title,
              value,
              description,
              issuer,
              reverse_image,
              obverse_image,
            },
          },
        }) => (
          <div className="flex flex-row items-center gap-2">
            <div className="flex gap-1">
              <CoinPreviewImages
                obverseImage={obverse_image}
                reverseImage={reverse_image}
                size="size-8"
                title={title}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-start gap-2">
                <img
                  alt={`${issuer.name} flag`}
                  className="h-3 w-4.5 shrink-0 mt-0.5"
                  loading="lazy"
                  src={issuer.flag?.length ? issuer.flag : undefined}
                />
                <span className="font-serif font-medium leading-4 overflow-hidden text-wrap line-clamp-2">
                  {asFraction(title, value)}
                </span>
              </div>
              {description?.length ? (
                <span className="text-muted-foreground text-xs italic pl-6.5 truncate w-full">
                  {description}
                </span>
              ) : null}
            </div>
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
      meta: {
        size: 20,
        skeleton: () => (
          <div className="pr-2 flex justify-end items-center">
            <Skeleton className="size-3 rounded" />
          </div>
        ),
      },
      cell: ({
        row: {
          original: { notebook_id },
        },
      }) => {
        if (notebook_id == null) return null;

        if (notebook_id === selectedNotebookId) {
          return (
            <div className="pr-2 h-8 flex justify-end items-center">
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
          <div className="pr-2 h-8 flex justify-end items-center">
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
