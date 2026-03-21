import { useCallback, useEffect, useState } from "react";

import { SortingState } from "@tanstack/react-table";

import {
  DataTable,
  DataTableProps,
} from "@/components/composite/data-table.tsx";
import { SearchInput } from "@/components/composite/search-input.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { CreateCoinDialog } from "@/pages/coins/components/forms/create-coin-dialog.tsx";
import { EmptyCoins } from "@/pages/coins/components/misc/empty-coins.tsx";
import { useCoinsTableColumns } from "@/pages/coins/hooks/use-coins-table-columns.tsx";
import { useListCoins } from "@/query/commands/coins.ts";
import { Coin, ListCoinsRequest } from "@/query/types";

interface CoinsListProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selection: DataTableProps<Coin>["selection"];
}

export function CoinsTable({
  searchQuery,
  onSearchQueryChange,
  selection,
}: CoinsListProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issuer", desc: false },
  ]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { page, size, setPage, handlePageSizeChange } = usePagination(10);

  const listCoinsOptions: ListCoinsRequest = {
    search: debouncedSearchQuery || undefined,
    page: page - 1,
    pageSize: size,
    sortField: sorting.length > 0 ? sorting[0].id : "year",
    sortDirection: sorting.length > 0 && !sorting[0].desc ? "asc" : "desc",
  };

  const { data, isLoading } = useListCoins(listCoinsOptions);
  const columns = useCoinsTableColumns();

  const handlePaginationChange = useCallback(
    async (pageIndex: number, pageSize: number) => {
      if (pageSize !== size) {
        handlePageSizeChange(pageSize);
        setPage(1);
      } else {
        setPage(pageIndex);
      }
    },
    [size, handlePageSizeChange, setPage]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, setPage]);

  return (
    <section
      aria-busy={isLoading}
      aria-label="Coins table"
      className="h-full w-3/4 flex flex-col pt-4 pb-0 border-r"
    >
      <header className="shrink-0 px-5 pb-2">
        <div className="flex items-center gap-2.5">
          <SearchInput
            aria-describedby="search-help"
            count={data?.total}
            onSearch={(e) => {
              onSearchQueryChange(e.target.value);
            }}
            placeholder="Search coins..."
            search={searchQuery}
          />
          <span className="sr-only" id="search-help">
            Search by issuer, year, or value
          </span>
          <CreateCoinDialog size="sm" />
        </div>
      </header>
      <DataTable<Coin>
        columns={columns}
        data={data?.items ?? []}
        empty={
          <EmptyCoins
            type={debouncedSearchQuery.length ? "no match" : "no data"}
          />
        }
        loading={isLoading}
        pagination={{
          pageIndex: page,
          pageSize: size,
          pageCount: Math.ceil((data?.total ?? 0) / size),
          onPaginationChange: handlePaginationChange,
        }}
        selection={selection}
        sort={{
          sorting,
          onSortingChange: setSorting,
        }}
      />
    </section>
  );
}
