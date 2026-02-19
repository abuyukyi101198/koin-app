import {
  DataTable,
  DataTableProps,
} from "@/components/composite/data-table.tsx";
import { useSimilarCoinsTableColumns } from "@/pages/coins/hooks/use-similar-coins-table-columns.tsx";
import { useGetSimilarCoins } from "@/query/commands/coins.ts";
import { Coin } from "@/query/types";

interface SimilarCoinsProps {
  coinId: number;
  pageSize?: number;
  selection: DataTableProps<Coin>["selection"];
}

export function SimilarCoins({
  coinId,
  pageSize = 10,
  selection,
}: SimilarCoinsProps) {
  const { data, isLoading } = useGetSimilarCoins({
    id: coinId,
    pageSize,
  });

  const columns = useSimilarCoinsTableColumns();

  return (
    <div className="h-full w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b px-6 pt-8 pb-5">
        <div className="space-y-1">
          <h2 className="scroll-m-20 text-xl font-medium tracking-wide text-balance">
            Similar coins
          </h2>
          <h3 className="text-base font-normal italic text-muted-foreground">
            Browse similar coins from your catalogue.
          </h3>
        </div>
      </div>
      <DataTable<Coin>
        className="[&_tr_td]:py-3"
        columns={columns}
        data={data?.items ?? []}
        empty={
          <div className="w-full text-left pl-4">No similar coins found.</div>
        }
        header={false}
        loading={isLoading}
        selection={selection}
      />
    </div>
  );
}
