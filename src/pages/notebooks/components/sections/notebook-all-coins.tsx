import { useCallback, useEffect, useState } from "react";

import { SortingState } from "@tanstack/react-table";

import { DataTable } from "@/components/composite/data-table.tsx";
import { SearchInput } from "@/components/composite/search-input.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { useSimilarCoinsTableColumns } from "@/pages/coins/hooks/use-similar-coins-table-columns.tsx";
import { useNotebookReorderContext } from "@/pages/notebooks/context/notebook-reorder-context.tsx";
import { useListCoins } from "@/query/commands/coins.ts";
import { Coin, ListCoinsRequest } from "@/query/types";

export function NotebookAllCoins() {
  const { hand, isActive, pickUp } = useNotebookReorderContext();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issuer", desc: false },
  ]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { page, size, setPage } = usePagination(50);

  const listCoinsOptions: ListCoinsRequest = {
    search: debouncedSearchQuery || undefined,
    page: page - 1,
    pageSize: size,
    sortField: sorting.length > 0 ? sorting[0].id : "year",
    sortDirection: sorting.length > 0 && !sorting[0].desc ? "asc" : "desc",
  };

  const { data, isLoading } = useListCoins(listCoinsOptions);
  const columns = useSimilarCoinsTableColumns();

  const handlePaginationChange = useCallback(
    async (pageIndex: number, _pageSize: number) => {
      setPage(pageIndex);
    },
    [setPage]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, setPage]);

  const handIds = new Set(hand.map((c) => c.id));

  const handleRowSelection = useCallback(
    (updaterOrValue: unknown) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue({})
          : updaterOrValue;
      const selectedId = Object.keys(next as Record<string, boolean>)[0];
      if (!selectedId) return;
      const coin = data?.items.find((c) => c.id.toString() === selectedId);
      if (coin) pickUp(coin);
    },
    [data?.items, pickUp]
  );

  return (
    <section
      aria-busy={isLoading}
      aria-label="All coins"
      className="flex flex-col h-full w-1/4 overflow-hidden"
    >
      <header className="shrink-0 border-b px-6 pt-8 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-medium tracking-wide">All coins</h2>
          <p className="text-base font-normal italic text-muted-foreground">
            {isActive
              ? "Click a coin to add it to your hand."
              : "Click a coin to pick it up."}
          </p>
        </div>
        <div className="mt-3">
          <SearchInput
            count={data?.total}
            onSearch={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search coins..."
            search={searchQuery}
          />
        </div>
      </header>

      <div className="contents [&_tr[aria-selected=true]]:opacity-40 [&_tr[aria-selected=true]]:pointer-events-none">
        <DataTable<Coin>
          columns={columns}
          data={data?.items ?? []}
          empty={
            <p className="text-sm text-muted-foreground px-4">
              {debouncedSearchQuery.length
                ? "No coins match your search."
                : "No coins found."}
            </p>
          }
          header={false}
          loading={isLoading}
          pagination={{
            pageIndex: page,
            pageCount: Math.ceil((data?.total ?? 0) / size),
            onPaginationChange: handlePaginationChange,
          }}
          selection={{
            rowSelection: Object.fromEntries(
              [...handIds].map((id) => [id, true])
            ),
            onRowSelectionChange: handleRowSelection,
          }}
          sort={{
            sorting,
            onSortingChange: setSorting,
          }}
        />
      </div>
    </section>
  );
}
