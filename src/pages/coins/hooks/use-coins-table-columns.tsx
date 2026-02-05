import { ColumnDef } from "@tanstack/react-table";
import { Coin } from "@/commands/coins.ts";
import { useMemo } from "react";
import { DataTableColumnHeader } from "../../../components/composite/data-table-column-header.tsx";

export function useCoinsTableColumns(): ColumnDef<Coin>[] {
  return useMemo(
    () => [
      {
        id: "images",
        accessorKey: "obverse_image",
        header: "Images",
        cell: ({ row }) => {
          const obverse = row.original.obverse_image;
          const reverse = row.original.reverse_image;
          return (
            <div className="flex gap-2">
              <div className="w-12 h-12 flex items-center justify-center">
                {reverse ? (
                  <img
                    src={reverse}
                    alt="Coin reverse"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                    R
                  </div>
                )}
              </div>
              <div className="w-12 h-12 flex items-center justify-center">
                {obverse ? (
                  <img
                    src={obverse}
                    alt="Coin obverse"
                    className="max-w-full max-h-full object-contain rounded"
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
        cell: ({ row }) => {
          return <div className="font-medium">{row.getValue("title")}</div>;
        },
      },
      {
        id: "issuer",
        accessorKey: "issuer",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Issuer" />
        ),
      },
      {
        id: "year",
        accessorKey: "year",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Year" />
        ),
      },
      {
        id: "value",
        accessorKey: "value",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Value" />
        ),
        cell: ({ row }) => {
          const value = row.getValue("value") as number;
          const unit = row.original.currency;
          return (
            <div>
              {value} {unit}
            </div>
          );
        },
      },
      {
        id: "currency",
        accessorKey: "currency",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Currency" />
        ),
      },
    ],
    []
  );
}
