import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/composite/data-table-column-header.tsx";
import { Coin } from "@/query/types";

export function useCoinsTableColumns(): ColumnDef<Coin>[] {
  return useMemo(
    () => [
      {
        id: "images",
        accessorKey: "obverse_image",
        header: "Images",
        cell: ({
          row: {
            original: { reverse_image, obverse_image },
          },
        }) => {
          return (
            <div className="flex gap-2">
              <div className="h-14 aspect-square flex items-center justify-center">
                {reverse_image ? (
                  <img
                    alt="Coin reverse"
                    className="max-w-full max-h-full object-contain rounded"
                    src={reverse_image}
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                    R
                  </div>
                )}
              </div>
              <div className="h-14 aspect-square flex items-center justify-center">
                {obverse_image ? (
                  <img
                    alt="Coin obverse"
                    className="max-w-full max-h-full object-contain rounded"
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
        cell: ({
          row: {
            original: { title, description },
          },
        }) => {
          return (
            <div className="flex flex-col">
              <span>{title}</span>
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
                    className="h-4 w-6"
                    loading="lazy"
                    src={issuer.flag?.length ? issuer.flag : undefined}
                  />
                </span>
                <span>{issuer.name}</span>
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
        cell: ({ row }) => {
          return (
            <div className="text-right">{row.getValue("year") as number}</div>
          );
        },
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Quantity" />
        ),
        cell: ({
          row: {
            original: { quantity },
          },
        }) => {
          return <div className="text-right">{quantity}</div>;
        },
      },
      {
        id: "sale_value",
        accessorKey: "sale_value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Est. sale value" />
        ),
        cell: ({
          row: {
            original: { sale_value },
          },
        }) => {
          return (
            <div className="text-right">
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
