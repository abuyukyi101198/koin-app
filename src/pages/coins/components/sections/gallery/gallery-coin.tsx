import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface GalleryCoinProps {
  coin: Coin;
  isSelected: boolean;
  onSelect: () => void;
}

export function GalleryCoin({ coin, isSelected, onSelect }: GalleryCoinProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col gap-3 rounded-lg border p-3",
        "cursor-pointer transition-colors",
        "hover:bg-muted!",
        "data-[state=selected]:bg-accent/50!",
        "overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-0.75",
        "before:bg-transparent before:transition-colors",
        "data-[state=selected]:before:bg-primary"
      )}
      data-state={isSelected ? "selected" : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="listitem"
      tabIndex={0}
    >
      {/* Coin images */}
      <div className="flex justify-between gap-1.5">
        <CoinPreviewImages
          obverseImage={coin.obverse_image}
          reverseImage={coin.reverse_image}
          title={coin.title}
        />
      </div>

      {/* Details — fixed-height text rows so all cards are the same height */}
      <div className="w-full flex flex-col items-center gap-1">
        <img
          alt={`${coin.issuer.name} flag`}
          className="h-3 w-4.5 shrink-0"
          loading="lazy"
          src={coin.issuer.flag?.length ? coin.issuer.flag : undefined}
        />
        <p className="pb-0.5 w-full font-serif font-medium leading-4 line-clamp-2 text-center overflow-hidden">
          {asFraction(coin.title, coin.value)}
        </p>
        <p className="h-8 w-full text-xs leading-4 line-clamp-2 text-muted-foreground text-center overflow-hidden">
          {coin.issuer.name}
        </p>
      </div>
    </article>
  );
}

GalleryCoin.Skeleton = () => {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex justify-between gap-1.5">
        <CoinPreviewImages.Skeleton />
      </div>
      <div className="h-15 flex flex-col items-center gap-1">
        <Skeleton className="h-3 w-4.5 rounded" />
        <Skeleton className="pb-0.5 h-4 w-3/4 rounded" />
        <Skeleton className="h-8 w-1/2 rounded" />
      </div>
    </div>
  );
};
