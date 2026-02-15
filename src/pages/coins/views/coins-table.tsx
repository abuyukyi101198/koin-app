import { useEffect, useState } from "react";

import { SortingState } from "@tanstack/react-table";

import {
  DataTable,
  DataTableProps,
} from "@/components/composite/data-table.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { AddCoinDialog } from "@/pages/coins/components/add-coin-dialog.tsx";
import { EmptyCoins } from "@/pages/coins/components/empty-coins.tsx";
import { useCoinsTableColumns } from "@/pages/coins/hooks/use-coins-table-columns.tsx";
import { useListCoins } from "@/query/commands/coins.ts";
import { Coin, ListCoinsRequest } from "@/query/types";

interface CoinsListProps {
  selection: DataTableProps<Coin>["selection"];
}

export function CoinsTable({ selection }: CoinsListProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issuer", desc: false },
  ]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { page, size, setPage } = usePagination(10);

  // Build search/sort options for the hook
  const listCoinsOptions: ListCoinsRequest = {
    search: debouncedSearchQuery || undefined,
    page: page - 1,
    pageSize: size,
    sortField: sorting.length > 0 ? sorting[0].id : "year",
    sortDirection: sorting.length > 0 && !sorting[0].desc ? "asc" : "desc",
  };

  const { data, isLoading, refetch } = useListCoins(listCoinsOptions);
  const columns = useCoinsTableColumns();

  const handlePaginationChange = async (pageIndex: number) => {
    setPage(pageIndex);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  useEffect(() => {
    if (
      data?.items &&
      Object.keys(selection?.rowSelection ?? {}).length === 0
    ) {
      selection?.onRowSelectionChange({ [data.items[0].id]: true });
    }
  }, [data?.items, selection]);

  return (
    <div className="h-full w-full flex justify-center items-start p-6 pb-0">
      <DataTable<Coin>
        actions={<AddCoinDialog onSuccess={handleRefresh} />}
        columns={columns}
        data={data?.items ?? []}
        empty={
          <EmptyCoins
            refresh={handleRefresh}
            type={searchQuery.length ? "no match" : "no data"}
          />
        }
        loading={isLoading}
        pagination={{
          pageIndex: page,
          pageSize: size,
          pageCount: Math.ceil((data?.total ?? 0) / size),
          onPaginationChange: handlePaginationChange,
        }}
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search your catalogue...",
        }}
        selection={selection}
        sort={{
          sorting,
          onSortingChange: setSorting,
        }}
      />
    </div>
  );
}
