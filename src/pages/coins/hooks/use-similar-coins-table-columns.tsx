import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";
import { truncate } from "@/utils/truncate.ts";

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
              original: { reverse_image, obverse_image },
            },
          }) => {
            return (
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
            const limit = 30;
            const formattedTitle = asFraction(title, value);

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
                  <span className="text-xs font-medium">{formattedTitle}</span>
                </div>
                <span
                  className="text-muted-foreground text-xs italic pl-6.5"
                  title={
                    (description?.length ?? 0) > limit ? description : undefined
                  }
                >
                  {description?.length ? truncate(description, limit) : "—"}
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
