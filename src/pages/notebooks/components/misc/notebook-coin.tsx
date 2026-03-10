import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

interface NotebookCoinProps {
  coin: Coin;
}

export function NotebookCoin({ coin }: NotebookCoinProps) {
  return (
    <>
      <div className="flex gap-2 mt-auto mb-auto px-2">
        <div className="aspect-square flex items-center justify-center">
          {coin.reverse_image ? (
            <img
              alt="Coin reverse"
              className="max-w-full max-h-full object-contain rounded-full"
              draggable={false}
              src={coin.reverse_image}
            />
          ) : (
            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
              R
            </div>
          )}
        </div>
        <div className="aspect-square flex items-center justify-center">
          {coin.obverse_image ? (
            <img
              alt="Coin obverse"
              className="max-w-full max-h-full object-contain rounded-full"
              draggable={false}
              src={coin.obverse_image}
            />
          ) : (
            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
              O
            </div>
          )}
        </div>
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
