import { Fragment } from "react";

import { ArrowUpRightIcon } from "lucide-react";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface IssuerCoinProps {
  coin: Coin;
  onSelect: () => void;
}

export function IssuerCoin({ coin, onSelect }: IssuerCoinProps) {
  const [numericWord, ...currencyWords] = coin.title.split(" ");
  return (
    <li
      aria-label={`${asFraction(coin.title, coin.value)}, ${coin.year}`}
      className={cn(
        "group relative flex flex-col gap-2 rounded-lg border p-1 items-center",
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
      {/* Hover overlay */}
      <div
        aria-hidden="true"
        className="absolute z-10 inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-muted"
      >
        <ArrowUpRightIcon className="size-5 text-foreground drop-shadow-sm" />
      </div>
      {coin.quantity > 1 && (
        <span className="absolute top-1 right-1 text-[9px] font-medium leading-none bg-primary text-primary-foreground rounded px-1 py-0.5">
          ×{coin.quantity}
        </span>
      )}
      <div className="flex flex-col gap-1 items-center justify-center">
        <CoinPreviewImages
          display="both"
          obverseImage={coin.obverse_image}
          reverseImage={coin.reverse_image}
          size="size-12"
          title={coin.title}
        />
      </div>

      <div
        aria-hidden="true"
        className="w-full flex flex-col items-center gap-0.5"
      >
        <p className="w-full font-serif font-medium leading-4 text-xs text-center overflow-hidden">
          {asFraction(numericWord, coin.value)}
          {currencyWords.map((word, i) => (
            <Fragment key={i}>
              <br />
              {word}
            </Fragment>
          ))}
        </p>
        <p className="w-full text-[9px] leading-4 line-clamp-1 text-muted-foreground text-center overflow-hidden">
          {coin.sale_value
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(coin.sale_value)
            : "—"}
        </p>
      </div>
    </li>
  );
}

IssuerCoin.Skeleton = () => {
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-1 items-center">
      <div className="flex gap-1 items-center justify-center">
        <CoinPreviewImages.Skeleton display="both" size="size-8" />
      </div>
      <div
        aria-hidden="true"
        className="w-full flex flex-col items-center gap-0.5"
      >
        <Skeleton className="h-3 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
    </li>
  );
};
