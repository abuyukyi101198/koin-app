import { CoinsTable } from "@/pages/coins/views/coins-table.tsx";
import { ColumnDef } from "@tanstack/react-table";
import { useCoins, type Coin } from "@/commands/coins.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";

export const columns: ColumnDef<Coin>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
    header: "Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("title")}</div>;
    },
  },
  {
    id: "issuer",
    accessorKey: "issuer",
    header: "Issuer",
  },
  {
    id: "year",
    accessorKey: "year",
    header: "Year",
  },
  {
    id: "value",
    accessorKey: "value",
    header: "Value",
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
    header: "Currency",
  },
];

export function CoinsList() {
  const { coins, loading, error, refetch } = useCoins();

  if (loading) {
    return <div className="p-4">Loading coins...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error loading coins: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex justify-center items-center">
      <CoinsTable columns={columns} data={coins} />
    </div>
  );
}
