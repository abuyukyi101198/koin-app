import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { DataTableProps } from "@/components/composite/data-table.tsx";
import { Empty } from "@/components/ui/empty.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DeleteCoinDialog } from "@/pages/coins/components/forms/delete-coin-dialog.tsx";
import { UpdateCoinDialog } from "@/pages/coins/components/forms/update-coin-dialog.tsx";
import { CoinDetails } from "@/pages/coins/components/sections/info/coin-details.tsx";
import { SimilarCoins } from "@/pages/coins/components/sections/info/similar-coins.tsx";
import { useGetCoin } from "@/query/commands";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface CoinInfoProps {
  coinId: number | null;
  selection: DataTableProps<Coin>["selection"];
}

export function CoinInfo({ coinId, selection }: CoinInfoProps) {
  const { data, isLoading } = useGetCoin({ id: coinId ?? 0 });

  if (!coinId || !data) {
    return <Empty className="bg-accent/50 rounded-none" />;
  }

  if (isLoading) {
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
      className="pl-4 pt-4 pr-1 h-full w-full flex flex-col overflow-hidden"
    >
      <header className="shrink-0 flex w-full justify-between">
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
        <div className="h-8 flex items-center gap-1 pr-4">
          <UpdateCoinDialog id={coinId} size="sm" />
          <DeleteCoinDialog id={coinId} size="sm" />
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

CoinInfo.Skeleton = () => {
  return (
    <section
      aria-hidden="true"
      className="pl-4 pt-4 pr-1 h-full w-full flex flex-col overflow-hidden"
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
          <CoinPreviewImages.Skeleton />
        </div>

        {/* Similar coins */}
        <SimilarCoins.Skeleton />

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
