import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SimilarCoin } from "@/pages/coins/components/sections/info/similar-coin.tsx";
import { useGetSimilarCoins } from "@/query/commands";

interface SimilarCoinsProps {
  coinId: number;
  isSelected: (id: number) => boolean;
  onSelect: (id: number) => void;
}

export function SimilarCoins({
  coinId,
  isSelected,
  onSelect,
}: SimilarCoinsProps) {
  const { data, isLoading } = useGetSimilarCoins({ id: coinId, pageSize: 3 });
  const items = data?.items ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section
      aria-labelledby="similar-coins-heading"
      className="flex flex-col pb-3"
    >
      <header className="shrink-0 border-b pt-4 pb-2">
        <h3
          className="scroll-m-20 font-serif font-medium tracking-wide"
          id="similar-coins-heading"
        >
          Similar coins
        </h3>
      </header>
      <ul
        aria-busy={isLoading}
        aria-labelledby="similar-coins-heading"
        className="grid grid-cols-3 gap-3 pt-3"
        role="listbox"
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <SimilarCoin.Skeleton key={i} />
            ))
          : items.map((coin) => (
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

SimilarCoins.Skeleton = () => {
  return (
    <section aria-hidden="true" className="flex flex-col pb-3">
      <div className="border-b pt-4 pb-2">
        <Skeleton className="h-4 w-28 rounded" />
      </div>
      <ul className="grid grid-cols-3 gap-3 pt-3" role="list">
        {Array.from({ length: 3 }).map((_, i) => (
          <SimilarCoin.Skeleton key={i} />
        ))}
      </ul>
    </section>
  );
};
