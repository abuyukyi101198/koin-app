import { RowSelectionState, Updater } from "@tanstack/react-table";

import {
  DataTable,
  DataTableProps,
} from "@/components/composite/data-table.tsx";
import { EmptyCoins } from "@/pages/coins/components/misc/empty-coins.tsx";
import { useCoinsTableColumns } from "@/pages/coins/hooks/use-coins-table-columns.tsx";
import { Coin } from "@/query/types";

interface CoinsTableProps {
  data: Coin[];
  searchQuery: string;
  loading: DataTableProps<Coin>["loading"];
  selection: DataTableProps<Coin>["selection"];
  sort: DataTableProps<Coin>["sort"];
  onRefresh?: () => void;
}

export function CoinsTable({
  data,
  searchQuery,
  loading,
  selection,
  sort,
  onRefresh,
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
      empty={
        <EmptyCoins
          onRefresh={onRefresh}
          type={searchQuery.length ? "no match" : "no data"}
        />
      }
      loading={loading}
      selection={guardedSelection}
      sort={sort}
    />
  );
}
