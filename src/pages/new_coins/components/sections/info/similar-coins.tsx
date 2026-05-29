import { SimilarCoin } from "@/pages/new_coins/components/sections/info/similar-coin.tsx";
import { Coin } from "@/query/types";

interface SimilarCoinsProps {
  coins: Coin[];
  isSelected: (id: number) => boolean;
  onSelect: (id: number) => void;
}

export function SimilarCoins({
  coins,
  isSelected,
  onSelect,
}: SimilarCoinsProps) {
  if (coins.length === 0) return null;

  return (
    <section
      aria-labelledby="similar-coins-heading"
      className="flex flex-col pb-3"
    >
      <header className="shrink-0 border-b pt-4 pb-2">
        <h2
          className="scroll-m-20 font-serif font-medium tracking-wide"
          id="similar-coins-heading"
        >
          Similar coins
        </h2>
      </header>
      <ul
        aria-labelledby="similar-coins-heading"
        className="grid grid-cols-3 gap-3 pt-3"
        role="listbox"
      >
        {coins.map((coin) => (
          <SimilarCoin
            coin={coin}
            isSelected={isSelected(coin.id)}
            key={coin.id}
            onSelect={() => {
              onSelect(coin.id);
            }}
          />
        ))}
      </ul>
    </section>
  );
}
