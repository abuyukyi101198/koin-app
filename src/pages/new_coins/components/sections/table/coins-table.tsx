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

  return (
    <DataTable<Coin>
      columns={columns}
      data={data}
      empty={<EmptyCoins type={searchQuery.length ? "no match" : "no data"} />}
      loading={loading}
      selection={selection}
      sort={sort}
    />
  );
}
