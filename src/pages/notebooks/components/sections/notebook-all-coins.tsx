import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const { hand, isActive, pickUp, place, placingRef, seedCursor } =
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

  const handIds = useMemo(() => new Set(hand.map((e) => e.coin.id)), [hand]);

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
      seedCursor({ x: e.clientX, y: e.clientY });
      pickUp(coin, "list");
    };

    el.addEventListener("contextmenu", onContextMenu);
    return () => {
      el.removeEventListener("contextmenu", onContextMenu);
    };
  }, [data?.items, handIds, pickUp, seedCursor]);

  // --- Left-click when hand active → place(null) = discard top coin ---
  const handleRowSelection = useCallback(
    (updaterOrValue: unknown) => {
      // When hand is active: drop the top coin and mark as handled.
      if (isActive) {
        placingRef.current = true;
        place(null);
        return;
      }
      // When hand is idle: rows are display-only, no selection state changes.
      void updaterOrValue;
    },
    [isActive, place, placingRef]
  );

  return (
    <section
      aria-busy={isLoading}
      aria-label="All coins"
      className="h-full w-1/4 flex flex-col pt-3 pb-0 gap-2 overflow-hidden select-none"
    >
      <header className="max-w-full flex items-center pl-2 pr-5 gap-2.5">
        <SearchInput
          count={data?.total}
          onSearch={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search coins..."
          search={searchQuery}
        />
      </header>

      <div
        className="contents [&_tr[aria-selected=true]]:opacity-40"
        onMouseDown={(e) => {
          // Prevent text selection and focus changes from consuming the
          // click when the hand is active, which would require a double-click.
          if (isActive) e.preventDefault();
        }}
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
