import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { CoinDetails } from "@/pages/new_coins/components/sections/info/coin-details.tsx";
import { SimilarCoin } from "@/pages/new_coins/components/sections/info/similar-coin.tsx";
import { SimilarCoins } from "@/pages/new_coins/components/sections/info/similar-coins.tsx";
import { DataTableProps } from "@/pages/new_coins/views/data-table.tsx";
import { useGetCoin } from "@/query/commands";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface CoinInfoProps {
  coinId: number | null;
  selection: DataTableProps<Coin>["selection"];
}

export function CoinInfo({ coinId, selection }: CoinInfoProps) {
  const { data, isLoading } = useGetCoin({ id: coinId ?? 0 });

  if (!coinId || isLoading) {
    return <CoinInfo.Skeleton />;
  }

  const isSelected = (id: number) =>
    selection?.rowSelection[id.toString()] ?? false;

  // Never deselect — only switch to a different coin.
  const selectItem = (id: number) => {
    if (!selection || isSelected(id)) return;
    selection.onRowSelectionChange({ [id.toString()]: true });
  };

  return (
    <section
      aria-busy={isLoading}
      aria-label="Coin details"
      className="h-full w-full flex flex-col overflow-hidden"
    >
      <header className="shrink-0 flex flex-col">
        <div className="mb-2 flex flex-col gap-1">
          <h2 className="scroll-m-20 text-2xl font-serif font-medium tracking-wide text-balance">
            {asFraction(data?.title, data?.value)}
          </h2>
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
          coinId={coinId}
          isSelected={isSelected}
          onSelect={selectItem}
        />

        {/* key resets CoinNotesField's expand state on coin change */}
        <CoinDetails data={data} key={coinId} />
      </ScrollArea>
    </section>
  );
}

CoinInfo.Skeleton = function CoinInfoSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="h-full w-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="shrink-0 mb-2 flex flex-col gap-1">
        <Skeleton className="h-7 w-3/4 rounded" />
        <div className="mb-1 flex items-center gap-2">
          <Skeleton className="h-3 w-4.5 shrink-0 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 pr-4 overflow-hidden flex flex-col">
        {/* Coin images */}
        <div className="my-4 flex w-full justify-between gap-2">
          <Skeleton className="aspect-square flex-1 rounded-full" />
          <Skeleton className="aspect-square flex-1 rounded-full" />
        </div>

        {/* Similar coins */}
        <div className="flex flex-col pb-3">
          <div className="border-b pt-4 pb-2">
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SimilarCoin.Skeleton key={i} />
            ))}
          </div>
        </div>

        {/* Details fields */}
        <div className="flex flex-col">
          <div className="border-b pt-4 pb-2">
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="flex flex-col gap-2 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="grid grid-cols-2 gap-2" key={i}>
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
