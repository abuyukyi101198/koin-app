import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { DataTableColumnHeader } from "@/components/composite/data-table-column-header.tsx";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

export function useCoinsTableColumns(): ColumnDef<Coin>[] {
  return useMemo(
    () =>
      [
        {
          id: "images",
          accessorKey: "obverse_image",
          enableSorting: false,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Image" />
          ),
          meta: {
            size: 75,
          },
          cell: ({
            row: {
              original: { title, reverse_image, obverse_image },
            },
          }) => {
            return (
              <div className="flex gap-2">
                <CoinPreviewImages
                  obverseImage={obverse_image}
                  reverseImage={reverse_image}
                  size="size-12"
                  title={title}
                />
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
            size: 120,
          },
          cell: ({
            row: {
              original: { title, value, description },
            },
          }) => {
            return (
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {asFraction(title, value)}
                </span>
                <span className="text-muted-foreground text-xs italic truncate w-full">
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
            size: 120,
            className: "md:table-cell hidden",
          },
          cell: ({
            row: {
              original: { issuer },
            },
          }) => {
            return (
              <div className="w-full flex items-start gap-2">
                <img
                  alt={`${issuer.name} flag`}
                  className="h-3 w-4.5 shrink-0 mt-0.5"
                  loading="lazy"
                  src={issuer.flag?.length ? issuer.flag : undefined}
                />
                <span className="text-xs leading-4 overflow-hidden text-wrap line-clamp-2">
                  {issuer.name}
                </span>
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
            size: 50,
            className: "lg:table-cell hidden",
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
            size: 50,
            className: "xl:table-cell hidden",
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
            size: 75,
            className: "2xl:table-cell hidden",
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
      ] as ColumnDef<Coin>[],
    []
  );
}
