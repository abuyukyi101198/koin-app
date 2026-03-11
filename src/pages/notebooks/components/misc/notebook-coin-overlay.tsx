import { NotebookCoin } from "@/pages/notebooks/components/misc/notebook-coin.tsx";
import { Coin } from "@/query/types";

interface NotebookCoinOverlayProps {
  coin: Coin;
  stackCount: number;
  isSelected: boolean;
}

export function NotebookDragOverlay({
  coin,
  stackCount,
  isSelected,
}: NotebookCoinOverlayProps) {
  const depth = Math.min(stackCount - 1, 2);
  return (
    <div className="relative w-full h-full">
      {Array.from({ length: depth }, (_, i) => (
        <div
          className="absolute inset-0 rounded-sm border border-border bg-background"
          key={i}
          style={{
            transform: `translate(${(i + 1) * 4}px, ${(i + 1) * 4}px)`,
            zIndex: -i - 1,
          }}
        />
      ))}
      <div className="absolute inset-0 overflow-hidden rounded-sm border border-border bg-background shadow-xl">
        <div className="h-full flex items-start justify-center">
          <NotebookCoin coin={coin} isSelected={isSelected} />
        </div>
        {stackCount > 1 && (
          <div className="absolute right-1.5 top-1.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 pointer-events-none">
            <span className="text-[10px] font-semibold leading-none text-primary-foreground">
              {stackCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
