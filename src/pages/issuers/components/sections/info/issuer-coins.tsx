import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { EmptyIssuedCoins } from "@/pages/issuers/components/misc/empty-issued-coins.tsx";
import { IssuerCoin } from "@/pages/issuers/components/sections/info/issuer-coin.tsx";
import { Coin } from "@/query/types";

interface IssuerCoinsProps {
  coins: Coin[] | undefined;
  onSelect: (id: number) => void;
  onViewMore: (id?: number) => void;
}

export function IssuerCoins({ coins, onSelect, onViewMore }: IssuerCoinsProps) {
  return (
    <section
      aria-labelledby="issuer-coins-heading"
      className="flex flex-col pb-3"
    >
      <header className="w-full flex justify-between border-b pt-4 pb-2">
        <h3
          className="scroll-m-20 font-serif font-medium tracking-wide"
          id="issuer-coins-heading"
        >
          Issued coins
        </h3>
        <Button
          className="p-0 h-min self-center text-xs text-primary hover:underline cursor-pointer"
          onClick={() => {
            onViewMore(coins && coins.length ? coins[0].id : undefined);
          }}
          variant="link"
        >
          View all
        </Button>
      </header>
      {!coins || coins.length === 0 ? (
        <EmptyIssuedCoins />
      ) : (
        <ul
          aria-labelledby="issuer-coins-heading"
          className="grid grid-cols-3 gap-3 pt-3"
          role="listbox"
        >
          {coins.map((coin) => (
            <IssuerCoin
              coin={coin}
              key={coin.id}
              onSelect={() => {
                onSelect(coin.id);
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

IssuerCoins.Skeleton = () => {
  return (
    <section aria-hidden="true" className="flex flex-col pb-3">
      <div className="border-b pt-4 pb-2">
        <Skeleton className="h-4 w-28 rounded" />
      </div>
      <ul className="grid grid-cols-3 gap-3 pt-3" role="list">
        {Array.from({ length: 6 }).map((_, i) => (
          <IssuerCoin.Skeleton key={i} />
        ))}
      </ul>
    </section>
  );
};
