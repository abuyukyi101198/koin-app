import { RowSelectionState, Updater } from "@tanstack/react-table";

import { EmptyCoins } from "@/pages/coins/components/misc/empty-coins.tsx";
import { useCoinsTableColumns } from "@/pages/new_coins/hooks/use-coins-table-columns.tsx";
import {
  DataTable,
  DataTableProps,
} from "@/pages/new_coins/views/data-table.tsx";
import { Coin } from "@/query/types";

interface CoinsTableProps {
  data: Coin[];
  searchQuery: string;
  loading: DataTableProps<Coin>["loading"];
  selection: DataTableProps<Coin>["selection"];
  sort: DataTableProps<Coin>["sort"];
}

export function CoinsTable({
  data,
  searchQuery,
  loading,
  selection,
  sort,
}: CoinsTableProps) {
  const columns = useCoinsTableColumns();

  const guardedSelection: DataTableProps<Coin>["selection"] = selection
    ? {
        rowSelection: selection.rowSelection,
        onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
          const next =
            typeof updater === "function"
              ? updater(selection.rowSelection)
              : updater;
          if (!Object.values(next).some(Boolean)) return;
          selection.onRowSelectionChange(updater);
        },
      }
    : undefined;

  return (
    <DataTable<Coin>
      columns={columns}
      data={data}
      empty={<EmptyCoins type={searchQuery.length ? "no match" : "no data"} />}
      loading={loading}
      selection={guardedSelection}
      sort={sort}
    />
  );
}
