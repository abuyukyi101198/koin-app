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
    <section
      aria-busy={isLoading}
      aria-label="Similar coins table"
      className="flex flex-col h-full w-1/4 overflow-hidden border-b"
    >
      <header className="shrink-0 border-b px-6 pt-8 pb-5">
        <div className="space-y-1">
          <h2 className="scroll-m-20 text-xl font-medium tracking-wide text-balance">
            Similar coins
          </h2>
          <p className="text-base font-normal italic text-muted-foreground">
            Browse similar coins from your catalogue.
          </p>
        </div>
      </header>

      <DataTable<Coin>
        aria-label="Similar coins list"
        className="[&_tr_td]:py-3"
        columns={columns}
        data={data?.items ?? []}
        empty={
          <div
            aria-live="polite"
            className="w-full text-left pl-4"
            role="status"
          >
            <p className="text-sm text-muted-foreground">
              No similar coins found.
            </p>
          </div>
        }
        header={false}
        loading={isLoading}
        selection={selection}
      />
    </section>
  );
}
