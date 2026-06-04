import { Check } from "lucide-react";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { cn } from "@/lib/utils.ts";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface NotebookCoinProps {
  coin: Coin;
  isSelected?: boolean;
  isLandscape?: boolean;
}

export function NotebookCoin({
  coin,
  isSelected = false,
  isLandscape = false,
}: NotebookCoinProps) {
  return (
    <div className="absolute inset-2">
      {isSelected && (
        <div className="absolute top-1.5 left-1.5 z-20 size-4 rounded-full bg-primary flex items-center justify-center shadow-sm pointer-events-none animate-in zoom-in-50 duration-150">
          <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
      <div
        className={cn(
          "h-full w-full flex",
          isLandscape
            ? "flex-row items-center gap-2"
            : "flex-col items-center justify-center gap-1"
        )}
      >
        {/* Coin image */}
        <div className="h-full flex items-center justify-center overflow-hidden p-2 aspect-square">
          <CoinPreviewImages
            display="obverse"
            obverseImage={coin.obverse_image}
            title={coin.title}
          />
        </div>

        <Separator orientation={isLandscape ? "vertical" : "horizontal"} />
        {/* Metadata */}
        <div
          className={cn(
            "flex flex-col",
            isLandscape
              ? "h-full pt-2 justify-center items-start flex-1 gap-1"
              : "items-center w-full gap-0"
          )}
        >
          <img
            alt={`${coin.issuer.name} flag`}
            className="absolute top-0 right-0 h-3 w-4.5"
            draggable={false}
            loading="lazy"
            src={coin.issuer.flag?.length ? coin.issuer.flag : undefined}
          />
          <p
            className={cn(
              "pb-0.5 w-full font-serif font-medium leading-4 line-clamp-1 text-center overflow-hidden",
              isLandscape ? "text-left" : "text-center"
            )}
          >
            {asFraction(`${coin.value} ${coin.currency}`, coin.value)}
          </p>
          <p className="text-[9px] leading-2.5 line-clamp-1 text-muted-foreground">
            {coin.year}
          </p>
          <p className="h-4.5 max-w-full text-[9px] leading-2.5 line-clamp-2 text-muted-foreground overflow-hidden">
            {coin.issuer.name}
          </p>
        </div>
      </div>
    </div>
  );
}
