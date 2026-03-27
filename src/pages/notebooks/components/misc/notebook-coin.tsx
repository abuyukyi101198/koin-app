import { Check } from "lucide-react";

import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface NotebookCoinProps {
  coin: Coin;
  isSelected?: boolean;
}

export function NotebookCoin({ coin, isSelected = false }: NotebookCoinProps) {
  return (
    <>
      {isSelected && (
        <div className="absolute top-1.5 left-1.5 z-10 size-4 rounded-full bg-primary flex items-center justify-center shadow-sm pointer-events-none animate-in zoom-in-50 duration-150">
          <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
      <div className="flex gap-2 mt-auto mb-auto px-2">
        <CoinPreviewImages
          obverseImage={coin.obverse_image}
          reverseImage={coin.reverse_image}
          title={coin.title}
        />
      </div>
      <div className="flex gap-2 justify-end absolute bottom-0 w-full text-xs py-1 px-3 backdrop-blur-2xl">
        <img
          alt={`${coin.issuer.name} flag`}
          className="h-3 w-4.5 mt-0.5"
          draggable={false}
          loading="lazy"
          src={coin.issuer.flag?.length ? coin.issuer.flag : undefined}
        />
        <span className="text-xs font-medium">
          {asFraction(coin.title, coin.value)}
        </span>
      </div>
    </>
  );
}
