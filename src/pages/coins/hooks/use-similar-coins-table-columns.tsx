import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

export function useSimilarCoinsTableColumns(): ColumnDef<Coin>[] {
  return useMemo(
    () =>
      [
        {
          id: "images",
          accessorKey: "obverse_image",
          enableSorting: false,
          meta: {
            size: 20,
          },
          cell: ({
            row: {
              original: { title, reverse_image, obverse_image },
            },
          }) => {
            return (
              <div className="flex gap-1">
                <CoinPreviewImages
                  obverseImage={obverse_image}
                  reverseImage={reverse_image}
                  size="size-8"
                  title={title}
                />
              </div>
            );
          },
        },
        {
          id: "title",
          accessorKey: "title",
          enableSorting: false,
          meta: {
            size: 60,
          },
          cell: ({
            row: {
              original: { title, value, description, issuer },
            },
          }) => {
            return (
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
            );
          },
        },
        {
          id: "year",
          accessorKey: "year",
          enableSorting: false,
          meta: {
            size: 20,
            responsiveClass: "2xl:table-cell hidden",
          },
          cell: ({
            row: {
              original: { year, sale_value },
            },
          }) => {
            return (
              <div className="flex flex-col">
                <div className="text-xs text-right">{year}</div>
                <div className="text-xs text-right text-muted-foreground">
                  {sale_value
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(sale_value)
                    : "—"}
                </div>
              </div>
            );
          },
        },
      ] as ColumnDef<Coin>[],
    []
  );
}
