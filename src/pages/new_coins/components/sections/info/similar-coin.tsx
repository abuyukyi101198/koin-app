import { cn } from "@/lib/utils.ts";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";
import { resolveImageSrc } from "@/utils/resolveImageSrc.ts";

interface SimilarCoinProps {
  coin: Coin;
  isSelected: boolean;
  onSelect: () => void;
}

export function SimilarCoin({ coin, isSelected, onSelect }: SimilarCoinProps) {
  return (
    <li
      aria-label={`${asFraction(coin.title, coin.value)}, ${coin.issuer.name}, ${coin.year}`}
      aria-selected={isSelected}
      className={cn(
        "relative flex flex-col gap-2 rounded-lg border p-1 items-center",
        "cursor-pointer transition-colors select-none",
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
      role="option"
      tabIndex={0}
    >
      {/* aria-hidden: described by the li's aria-label above */}
      <figure
        aria-hidden="true"
        className="size-12 flex items-center justify-center overflow-hidden shrink-0"
      >
        {coin.reverse_image ? (
          <img
            alt=""
            className="max-w-full max-h-full object-contain"
            src={resolveImageSrc(coin.reverse_image)}
          />
        ) : (
          <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground rounded-full text-xs">
            R
          </div>
        )}
      </figure>

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
