import { DataTable } from "@/components/composite/data-table.tsx";
import { useListCoins } from "@/query/commands/coins.ts";
import { useCoinsTableColumns } from "@/pages/coins/hooks/use-coins-table-columns.tsx";
import { AddCoinDialog } from "@/pages/coins/components/add-coin-dialog.tsx";
import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { EmptyCoins } from "@/pages/coins/components/empty-coins.tsx";
import { ListCoinsRequest } from "@/query/types";

export function CoinsList() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issuer", desc: false },
  ]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Build search/sort options for the hook
  const listCoinsOptions: ListCoinsRequest = {
    search: debouncedSearchQuery || undefined,
    sortField: sorting.length > 0 ? sorting[0].id : "year",
    sortDirection: sorting.length > 0 && !sorting[0].desc ? "asc" : "desc",
  };

  const { data, loading, refetch, page, totalPages, pageSize, setPage } =
    useListCoins(listCoinsOptions);
  const columns = useCoinsTableColumns();

  return (
    <div className="h-full w-full flex justify-center items-start">
      <DataTable
        data={data ?? []}
        columns={columns}
        loading={loading}
        search={{
          enabled: true,
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search your catalogue...",
        }}
        sort={{
          enabled: true,
          sorting,
          onSortingChange: setSorting,
        }}
        pagination={{
          enabled: true,
          pageIndex: page,
          pageSize: pageSize,
          pageCount: totalPages,
          onPaginationChange: setPage,
        }}
        actions={<AddCoinDialog onSuccess={refetch} />}
        empty={
          <EmptyCoins
            type={searchQuery.length ? "no match" : "no data"}
            refresh={refetch}
          />
        }
      />
    </div>
  );
}
