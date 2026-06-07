import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface SimilarCoinProps {
  coin: Coin;
  onSelect: () => void;
}

export function SimilarCoin({ coin, onSelect }: SimilarCoinProps) {
  return (
    <li
      aria-label={`${asFraction(coin.title, coin.value)}, ${coin.issuer.name}, ${coin.year}`}
      className={cn(
        "relative flex flex-col gap-2 rounded-lg border p-1 items-center",
        "cursor-pointer transition-colors select-none",
        "hover:bg-muted!"
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="option"
      tabIndex={0}
    >
      <CoinPreviewImages
        display="obverse"
        obverseImage={coin.obverse_image}
        size="size-12"
        title={coin.title}
      />

      <div
        aria-hidden="true"
        className="w-full flex flex-col items-center gap-1"
      >
        <img
          alt=""
          className="h-3 w-4.5 shrink-0"
          loading="lazy"
          src={coin.issuer.flag?.length ? coin.issuer.flag : undefined}
        />
        <p className="w-full font-serif font-medium leading-4 line-clamp-1 text-xs text-center overflow-hidden">
          {asFraction(coin.title, coin.value)}
        </p>
        <p className="h-8 w-full text-xs leading-4 line-clamp-2 text-muted-foreground text-center overflow-hidden">
          {coin.issuer.name}
        </p>
      </div>
    </li>
  );
}

SimilarCoin.Skeleton = () => {
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-1 items-center">
      <CoinPreviewImages.Skeleton display="obverse" size="size-12" />
      <div
        aria-hidden="true"
        className="h-14 w-full flex flex-col items-center gap-1"
      >
        <Skeleton className="h-3 w-4.5 rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </li>
  );
};
