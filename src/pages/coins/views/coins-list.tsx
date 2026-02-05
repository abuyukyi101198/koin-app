import { DataTable } from "@/components/composite/data-table.tsx";
import { useListCoins, type ListCoinsOptions } from "@/commands/coins.ts";
import { useCoinsTableColumns } from "@/pages/coins/hooks/use-coins-table-columns.tsx";
import { AddCoinDialog } from "@/pages/coins/components/add-coin-dialog.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce.ts";

export function CoinsList() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issuer", desc: false },
  ]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Build search/sort options for the hook
  const listCoinsOptions: ListCoinsOptions = {
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
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No Coins Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t added any coins to your catalogue yet. Get
                started by adding your first coins.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button variant="ghost" onClick={refetch}>
                Refresh
              </Button>
              <AddCoinDialog onSuccess={refetch} />
            </EmptyContent>
          </Empty>
        }
      />
    </div>
  );
}
