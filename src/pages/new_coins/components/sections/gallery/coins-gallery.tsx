import { cn } from "@/lib/utils.ts";
import { EmptyCoins } from "@/pages/coins/components/misc/empty-coins.tsx";
import { GalleryCoin } from "@/pages/new_coins/components/sections/gallery/gallery-coin.tsx";
import { DataTableProps } from "@/pages/new_coins/views/data-table.tsx";
import { Coin } from "@/query/types";

interface CoinsGalleryProps {
  data: Coin[];
  searchQuery: string;
  loading: DataTableProps<Coin>["loading"];
  selection: DataTableProps<Coin>["selection"];
}

export function CoinsGallery({
  data,
  searchQuery,
  loading,
  selection,
}: CoinsGalleryProps) {
  const isEmpty = !loading && data.length === 0;

  const isSelected = (id: number) =>
    selection?.rowSelection[id.toString()] ?? false;

  const selectItem = (id: number) => {
    // Never deselect — clicking the active card does nothing.
    if (!selection || isSelected(id)) return;
    selection.onRowSelectionChange({ [id.toString()]: true });
  };

  return (
    <div
      aria-busy={loading}
      aria-label="Coins gallery"
      className={cn(
        "flex-1 min-h-0 w-full",
        "overflow-y-scroll",
        "[&::-webkit-scrollbar]:w-2.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:border",
        "[&::-webkit-scrollbar-thumb]:border-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-border",
        "[&::-webkit-scrollbar-thumb]:bg-clip-content"
      )}
      role="region"
    >
      {loading ? (
        <div
          aria-label="Loading coins"
          className="grid grid-cols-5 gap-3 p-3"
          role="list"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <GalleryCoin.Skeleton key={i} />
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
            <GalleryCoin
              coin={coin}
              isSelected={isSelected(coin.id)}
              key={coin.id}
              onSelect={() => {
                selectItem(coin.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
