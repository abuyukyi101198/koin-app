import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { DataTableColumnHeader } from "@/components/composite/data-table-column-header.tsx";
import { IssuerFlag } from "@/components/composite/issuer-flag.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

export function useCoinsTableColumns(): ColumnDef<Coin>[] {
  return useMemo(
    () =>
      [
        {
          id: "title",
          accessorKey: "title",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Coin" />
          ),
          meta: {
            size: 120,
            skeleton: () => (
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <CoinPreviewImages.Skeleton size="size-12" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
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
                reverse_image,
                obverse_image,
              },
            },
          }) => {
            return (
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <CoinPreviewImages
                    obverseImage={obverse_image}
                    reverseImage={reverse_image}
                    size="size-12"
                    title={title}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-medium">
                    {asFraction(title, value)}
                  </span>
                  {description?.length ? (
                    <span className="text-muted-foreground text-xs italic truncate w-full">
                      {description}
                    </span>
                  ) : null}
                </div>
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
            size: 80,
            className: "md:table-cell hidden",
            skeleton: () => (
              <div className="flex items-start gap-2">
                <IssuerFlag.Skeleton className="h-3 w-4.5 shrink-0 rounded" />
                <Skeleton className="h-3 flex-1 rounded" />
              </div>
            ),
          },
          cell: ({
            row: {
              original: { issuer },
            },
          }) => {
            return (
              <div className="w-full flex items-start gap-2">
                <IssuerFlag
                  className="h-3 w-4.5 shrink-0 mt-0.5"
                  flag={issuer.flag}
                  name={issuer.name}
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
            <DataTableColumnHeader
              align="center"
              column={column}
              title="Year"
            />
          ),
          meta: {
            size: 50,
            className: "lg:table-cell hidden",
            skeleton: () => (
              <div className="flex justify-center">
                <Skeleton className="h-3 w-10 rounded" />
              </div>
            ),
          },
          cell: ({ row }) => {
            return (
              <div className="text-xs text-center">
                {row.getValue("year") as number}
              </div>
            );
          },
        },
        {
          id: "quantity",
          accessorKey: "quantity",
          header: ({ column }) => (
            <DataTableColumnHeader align="center" column={column} title="Qty" />
          ),
          meta: {
            size: 50,
            className: "xl:table-cell hidden",
            skeleton: () => (
              <div className="flex justify-center">
                <Skeleton className="h-3 w-6 rounded" />
              </div>
            ),
          },
          cell: ({
            row: {
              original: { quantity },
            },
          }) => {
            return <div className="text-xs text-center">{quantity}</div>;
          },
        },
        {
          id: "sale_value",
          accessorKey: "sale_value",
          header: ({ column }) => (
            <DataTableColumnHeader
              align="right"
              column={column}
              title="Est. sale value"
            />
          ),
          meta: {
            size: 75,
            className: "2xl:table-cell hidden",
            skeleton: () => (
              <div className="flex justify-end">
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ),
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
