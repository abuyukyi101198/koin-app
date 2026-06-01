import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SortingState } from "@tanstack/react-table";

import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import { SearchInput } from "@/components/composite/search-input.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { cn } from "@/lib/utils.ts";
import { DataTable } from "@/pages/new_coins/views/data-table.tsx";
import { useNotebookAllCoinsTableColumns } from "@/pages/new_notebooks/hooks/use-notebook-all-coins-table-columns.tsx";
import { useNotebookReorderContext } from "@/pages/notebooks/context/notebook-reorder-context.tsx";
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
      className="pl-4 pt-4 pr-4 h-full w-full flex flex-col overflow-hidden select-none"
    >
      <header className="shrink-0 flex flex-col border-b max-w-full items-center gap-2.5">
        <h2 className="pb-2 w-full scroll-m-20 text-xl font-serif font-medium tracking-wide text-balance border-b">
          All Coins
        </h2>
        <div
          aria-label="Table controls"
          className="pb-2 pr-2.5 w-full flex justify-end items-center gap-2.5"
          role="toolbar"
        >
          <SearchInput
            count={data?.total}
            onSearch={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search coins..."
            search={searchQuery}
          />
          <span className="sr-only" id="search-help">
            Search by issuer, year, or value
          </span>
        </div>
      </header>

      <div
        className={cn(
          "contents pr-4",
          "[&_tr[aria-selected=true]]:opacity-40",
          isActive ? "[&_tr]:cursor-cell" : "[&_tr]:cursor-grab"
        )}
        onMouseDown={(e) => {
          // Prevent text selection and focus changes from consuming the
          // click when the hand is active, which would require a double-click.
          if (isActive) e.preventDefault();
        }}
        ref={tableWrapperRef}
      >
        <DataTable<Coin>
          className="[&_tr_td]:py-3"
          columns={columns}
          data={data?.items ?? []}
          empty={
            <p className="text-sm text-muted-foreground px-4">
              {debouncedSearchQuery.length
                ? "No coins match your search."
                : "No coins found."}
            </p>
          }
          loading={isLoading}
          selection={{
            rowSelection: Object.fromEntries(
              [...handIds].map((id) => [id, true])
            ),
            onRowSelectionChange: handleRowSelection,
          }}
          showHeader={false}
          sort={{
            sorting,
            onSortingChange: setSorting,
          }}
        />
        <DataTablePagination
          onPaginationChange={handlePaginationChange}
          pageCount={Math.ceil((data?.total ?? 0) / size)}
          pageIndex={page}
        />
      </div>
    </section>
  );
}
