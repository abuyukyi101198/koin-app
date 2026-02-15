import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/composite/data-table-column-header.tsx";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

export function useCoinsTableColumns(): ColumnDef<Coin>[] {
  return useMemo(
    () => [
      {
        id: "images",
        accessorKey: "obverse_image",
        header: "Images",
        meta: {
          size: 120,
        },
        cell: ({
          row: {
            original: { reverse_image, obverse_image },
          },
        }) => {
          return (
            <div className="flex gap-2">
              <div className="h-12 aspect-square flex items-center justify-center">
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
              <div className="h-12 aspect-square flex items-center justify-center">
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        meta: {
          size: 200,
        },
        cell: ({
          row: {
            original: { title, value, description },
          },
        }) => {
          const formattedTitle = asFraction(title, value);

          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium">{formattedTitle}</span>
              <span className="text-muted-foreground text-xs italic">
                {description?.length ? description : "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "issuer",
        accessorKey: "issuer",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Issuer" />
        ),
        meta: {
          size: 180,
          responsiveClass: "md:table-cell hidden",
        },
        cell: ({
          row: {
            original: { issuer },
          },
        }) => {
          return (
            <div className="w-full flex justify-between">
              <div className="flex items-start gap-2">
                <span className="pt-0.5">
                  <img
                    alt={`${issuer.name} flag`}
                    className="h-3 w-4.5"
                    loading="lazy"
                    src={issuer.flag?.length ? issuer.flag : undefined}
                  />
                </span>
                <span className="text-xs">{issuer.name}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "year",
        accessorKey: "year",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Year" />
        ),
        meta: {
          size: 100,
          responsiveClass: "lg:table-cell hidden",
        },
        cell: ({ row }) => {
          return (
            <div className="text-xs text-right">
              {row.getValue("year") as number}
            </div>
          );
        },
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Quantity" />
        ),
        meta: {
          size: 100,
          responsiveClass: "xl:table-cell hidden",
        },
        cell: ({
          row: {
            original: { quantity },
          },
        }) => {
          return <div className="text-xs text-right">{quantity}</div>;
        },
      },
      {
        id: "sale_value",
        accessorKey: "sale_value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Est. sale value" />
        ),
        meta: {
          size: 140,
          responsiveClass: "2xl:table-cell hidden",
        },
        cell: ({
          row: {
            original: { sale_value },
          },
        }) => {
          return (
            <div className="text-xs text-right">
              {sale_value
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(sale_value)
                : "—"}
            </div>
          );
        },
      },
    ],
    []
  );
}
