import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { CoinDetails } from "@/pages/new_coins/components/sections/info/coin-details.tsx";
import { SimilarCoins } from "@/pages/new_coins/components/sections/info/similar-coins.tsx";
import { DataTableProps } from "@/pages/new_coins/views/data-table.tsx";
import { useGetCoin, useGetSimilarCoins } from "@/query/commands";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface CoinInfoProps {
  coinId: number;
  selection: DataTableProps<Coin>["selection"];
}
export function CoinInfo({ coinId, selection }: CoinInfoProps) {
  const { data, isLoading } = useGetCoin({ id: coinId });
  const { data: similarCoins } = useGetSimilarCoins({
    id: coinId,
    pageSize: 3,
  });

  const isSelected = (id: number) =>
    selection?.rowSelection[id.toString()] ?? false;

  const toggleSelection = (id: number) => {
    if (!selection) return;
    selection.onRowSelectionChange({ [id.toString()]: !isSelected(id) });
  };

  return (
    <section
      aria-busy={isLoading}
      aria-label="Coin details"
      className="h-full w-full flex flex-col overflow-hidden"
    >
      <header className="shrink-0 flex flex-col">
        <div className="mb-2 flex flex-col gap-1">
          <h1 className="scroll-m-20 text-2xl font-serif font-medium tracking-wide text-balance">
            {asFraction(data?.title, data?.value)}
          </h1>
          <div className="mb-1 w-full flex items-start gap-2">
            <img
              alt={`${data?.issuer.name} flag`}
              className="h-3 w-4.5 shrink-0 mt-0.5"
              loading="lazy"
              src={data?.issuer.flag?.length ? data?.issuer.flag : undefined}
            />
            <span className="pb-0.5 leading-4 overflow-hidden text-wrap line-clamp-2 font-sans text-sm text-muted-foreground">
              {data?.issuer.name}
            </span>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 min-h-0 pr-4">
        <section
          aria-label="Coin preview images"
          className="my-4 flex w-full justify-between items-center overflow-hidden gap-2"
        >
          <CoinPreviewImages
            obverseImage={data?.obverse_image}
            reverseImage={data?.reverse_image}
            title={data?.title ?? ""}
          />
        </section>

        <SimilarCoins
          coins={similarCoins?.items ?? []}
          isSelected={isSelected}
          onSelect={toggleSelection}
        />

        {/* key resets CoinNotesField's expand state on coin change */}
        <CoinDetails data={data} key={coinId} />
      </ScrollArea>
    </section>
  );
}
