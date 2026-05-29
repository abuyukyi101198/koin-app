import { useCallback, useEffect, useState } from "react";

import { SortingState } from "@tanstack/react-table";
import { Coins } from "lucide-react";

import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoinSelection } from "@/context/coin-selection-context.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { CoinsViewHeader } from "@/pages/new_coins/components/base/coins-view-header.tsx";
import { CoinsGallery } from "@/pages/new_coins/components/sections/gallery/coins-gallery.tsx";
import { CoinInfo } from "@/pages/new_coins/components/sections/info/coin-info.tsx";
import { CoinsTable } from "@/pages/new_coins/components/sections/table/coins-table.tsx";
import { useListCoins } from "@/query/commands";
import { ListCoinsRequest } from "@/query/types";

export function CoinsView() {
  const [view, setView] = useState<"gallery" | "table">("table");

  const { rowSelection, setRowSelection, selectedCoinId } = useCoinSelection();
  const [coinSearchQuery, setCoinSearchQuery] = useState<string>("");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "issuer", desc: false },
  ]);
  const debouncedSearchQuery = useDebounce(coinSearchQuery, 300);

  const { page, size, setPage, handlePageSizeChange } = usePagination(25);

  const listCoinsOptions: ListCoinsRequest = {
    search: debouncedSearchQuery || undefined,
    page: page - 1,
    pageSize: size,
    sortField: sorting.length > 0 ? sorting[0].id : "year",
    sortDirection: sorting.length > 0 && !sorting[0].desc ? "asc" : "desc",
  };

  const { data, isLoading } = useListCoins(listCoinsOptions);

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
    <Tabs className="h-full w-full gap-0 bg-accent/50" defaultValue="all-coins">
      <TabsList
        className="ml-3 mt-2 mr-3 pb-0! gap-2 font-serif items-end border-collapse"
        variant="line"
      >
        <TabsTrigger
          className="p-2! bg-background! group-data-[orientation=horizontal]/tabs:after:inset-x-0.5px
          group-data-[orientation=horizontal]/tabs:after:-bottom-0.5 after:bg-background
          border-primary! border-b-0! rounded-t-md rounded-b-none cursor-pointer"
          value="all-coins"
        >
          <Coins aria-hidden="true" className="size-3" />
          All Coins
        </TabsTrigger>
      </TabsList>
      <Separator className="bg-primary" />
      <TabsContent
        className="flex flex-col overflow-hidden pl-6 pr-1 bg-background"
        value="all-coins"
      >
        <ResizablePanelGroup
          className="flex-1 min-h-0"
          orientation="horizontal"
        >
          <ResizablePanel
            className="h-full pt-4 pr-4 flex flex-col"
            defaultSize="75%"
          >
            <CoinsViewHeader
              searchQuery={coinSearchQuery}
              setSearchQuery={setCoinSearchQuery}
              setView={setView}
              total={data?.total ?? 0}
            />
            {view === "table" ? (
              <CoinsTable
                data={data?.items ?? []}
                loading={isLoading}
                searchQuery={debouncedSearchQuery}
                selection={{
                  rowSelection,
                  onRowSelectionChange: setRowSelection,
                }}
                sort={{ sorting, onSortingChange: setSorting }}
              />
            ) : (
              <CoinsGallery
                data={data?.items ?? []}
                loading={isLoading}
                searchQuery={debouncedSearchQuery}
                selection={{
                  rowSelection,
                  onRowSelectionChange: setRowSelection,
                }}
              />
            )}
            <DataTablePagination
              onPaginationChange={handlePaginationChange}
              pageCount={Math.ceil((data?.total ?? 0) / size)}
              pageIndex={page}
              pageSize={size}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="h-full pl-4 pt-4 flex flex-col"
            defaultSize="25%"
          >
            <CoinInfo
              coinId={selectedCoinId}
              selection={{
                rowSelection,
                onRowSelectionChange: setRowSelection,
              }}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabsContent>
    </Tabs>
  );
}
