import { DataTable } from "@/pages/coins/components/data-table.tsx";
import { useListCoins } from "@/commands/coins.ts";
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

export function CoinsList() {
  const { data, loading, refetch } = useListCoins();
  const columns = useCoinsTableColumns();

  return (
    <div className="h-full w-full flex justify-center items-center">
      <DataTable
        data={data ?? []}
        columns={columns}
        loading={loading}
        headerConfig={{
          searchable: true,
          searchColumnId: "title",
          searchPlaceholder: "Search your catalogue...",
          showColumnToggle: true,
        }}
        headerActions={<AddCoinDialog onSuccess={refetch} />}
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
