import { useCallback, useEffect, useRef, useState } from "react";

import { SortingState } from "@tanstack/react-table";

import { DataTable } from "@/components/composite/data-table.tsx";
import { SearchInput } from "@/components/composite/search-input.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { useNotebookReorderContext } from "@/pages/notebooks/context/notebook-reorder-context.tsx";
import { useNotebookAllCoinsTableColumns } from "@/pages/notebooks/hooks/use-notebook-all-coins-table-columns.tsx";
import { useListCoins } from "@/query/commands/coins.ts";
import { Coin, ListCoinsRequest } from "@/query/types";

export function NotebookAllCoins() {
  const { hand, isActive, pickUp, place, placingRef } =
    useNotebookReorderContext();

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
  const columns = useNotebookAllCoinsTableColumns();

  const handlePaginationChange = useCallback(
    async (pageIndex: number, _pageSize: number) => {
      setPage(pageIndex);
    },
    [setPage]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, setPage]);

  const handIds = new Set(hand.map((e) => e.coin.id));

  // --- Right-click to pick up ---
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;

    const onContextMenu = (e: MouseEvent) => {
      // Walk up from the event target to find a <tr> with a data-coin-id
      const row = (e.target as HTMLElement).closest("tr[data-coin-id]");
      if (!row) return;
      e.preventDefault();
      const coinId = parseInt((row as HTMLElement).dataset.coinId ?? "", 10);
      if (isNaN(coinId)) return;
      const coin = data?.items.find((c) => c.id === coinId);
      if (!coin || handIds.has(coin.id)) return;
      pickUp(coin, "list");
    };

    el.addEventListener("contextmenu", onContextMenu);
    return () => {
      el.removeEventListener("contextmenu", onContextMenu);
    };
  }, [data?.items, handIds, pickUp]);

  // --- Left-click when hand active → place(null) = discard top coin ---
  const handleRowSelection = useCallback(
    (updaterOrValue: unknown) => {
      if (!isActive) return;
      placingRef.current = true;
      place(null);
      void updaterOrValue;
    },
    [isActive, place, placingRef]
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
              ? "Right-click a coin to pick it up. Left-click to drop."
              : "Right-click a coin to pick it up."}
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

      <div
        className="contents [&_tr[aria-selected=true]]:opacity-40 [&_tr[aria-selected=true]]:pointer-events-none"
        ref={tableWrapperRef}
      >
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
