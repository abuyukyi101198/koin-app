import { RowSelectionState, Updater } from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { EmptyCoins } from "@/pages/coins/components/misc/empty-coins.tsx";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";
import { resolveImageSrc } from "@/utils/resolveImageSrc.ts";

// ─── Shared scrollbar classes (matches DataTable) ────────────────────────────

const scrollbarClasses = [
  "overflow-y-scroll",
  "[&::-webkit-scrollbar]:w-2.5",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:border",
  "[&::-webkit-scrollbar-thumb]:border-transparent",
  "[&::-webkit-scrollbar-thumb]:bg-border",
  "[&::-webkit-scrollbar-thumb]:bg-clip-content",
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface CoinsGalleryProps {
  data: Coin[];
  loading?: boolean;
  searchQuery?: string;
  selection?: {
    rowSelection: RowSelectionState;
    onRowSelectionChange: (updaterOrValue: Updater<RowSelectionState>) => void;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CoinsGallery({
  data,
  loading = false,
  searchQuery = "",
  selection,
}: CoinsGalleryProps) {
  const isEmpty = !loading && data.length === 0;

  const isSelected = (id: number) =>
    selection?.rowSelection[id.toString()] ?? false;

  const toggleSelection = (id: number) => {
    if (!selection) return;
    selection.onRowSelectionChange({
      [id.toString()]: !isSelected(id),
    });
  };

  return (
    <div
      aria-busy={loading}
      aria-label="Coins gallery"
      className={cn("flex-1 min-h-0 w-full", ...scrollbarClasses)}
      role="region"
    >
      {loading ? (
        <div className="grid grid-cols-5 gap-3 p-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <CoinCardSkeleton key={i} />
          ))}
        </div>
      ) : isEmpty ? (
        <div
          aria-live="polite"
          className="flex h-full items-center justify-center"
          role="status"
        >
          <EmptyCoins type={searchQuery.length ? "no match" : "no data"} />
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3 p-3" role="list">
          {data.map((coin) => (
            <CoinCard
              coin={coin}
              isSelected={isSelected(coin.id)}
              key={coin.id}
              onSelect={() => {
                toggleSelection(coin.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CoinCardProps {
  coin: Coin;
  isSelected: boolean;
  onSelect: () => void;
}

function CoinCard({ coin, isSelected, onSelect }: CoinCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-3",
        "cursor-pointer transition-colors",
        "hover:bg-muted!",
        "data-[state=selected]:bg-accent/50!"
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
      <div className="flex justify-between">
        <figure className="flex items-center justify-center overflow-hidden aspect-square flex-1 min-h-0 max-h-full w-full">
          {coin.reverse_image ? (
            <>
              <img
                alt={`${coin.title} reverse side`}
                className="max-w-full max-h-full object-contain"
                src={resolveImageSrc(coin.reverse_image)}
              />
              <figcaption className="sr-only">Reverse side</figcaption>
            </>
          ) : (
            <div
              aria-label="Reverse image not available"
              className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground rounded-full"
            >
              R
            </div>
          )}
        </figure>
        <figure className="flex items-center justify-center overflow-hidden aspect-square flex-1 min-h-0 max-h-full w-full">
          {coin.obverse_image ? (
            <>
              <img
                alt={`${coin.title} obverse side`}
                className="max-w-full max-h-full object-contain"
                src={resolveImageSrc(coin.obverse_image)}
              />
              <figcaption className="sr-only">Obverse side</figcaption>
            </>
          ) : (
            <div
              aria-label="Obverse image not available"
              className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground rounded-full"
            >
              O
            </div>
          )}
        </figure>
      </div>

      {/* Details — fixed-height text rows so all cards are the same height */}
      <div className="w-full flex flex-col items-center gap-1">
        <img
          alt={`${coin.issuer.name} flag`}
          className="h-3 w-4.5 shrink-0"
          loading="lazy"
          src={coin.issuer.flag?.length ? coin.issuer.flag : undefined}
        />
        <p className="w-full font-serif font-medium leading-4 line-clamp-2 text-center overflow-hidden">
          {asFraction(coin.title, coin.value)}
        </p>
        <p className="h-8 w-full text-xs leading-4 line-clamp-2 text-muted-foreground text-center overflow-hidden">
          {coin.issuer.name}
        </p>
      </div>
    </article>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function CoinCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
      <div className="flex justify-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="size-12 rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Skeleton className="h-8 w-3/4 rounded" />
        <Skeleton className="h-3 w-4.5 rounded" />
        <Skeleton className="h-8 w-1/2 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
      </div>
    </div>
  );
}
