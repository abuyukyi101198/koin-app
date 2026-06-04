import { NotebookCoin } from "@/pages/notebooks/components/misc/notebook-coin.tsx";
import { Coin } from "@/query/types";

interface NotebookCoinOverlayProps {
  coin: Coin;
  stackCount: number;
  isLandscape?: boolean;
}

export function NotebookDragOverlay({
  coin,
  stackCount,
  isLandscape = false,
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
        <div className="absolute top-1.5 left-1.5 z-20 size-4 rounded-full bg-primary flex items-center justify-center shadow-sm pointer-events-none animate-in zoom-in-50 duration-150">
          <span className="text-[10px] font-semibold leading-none text-primary-foreground tabular-nums">
            {stackCount}
          </span>
        </div>
        <div className="h-full flex items-start justify-center">
          <NotebookCoin coin={coin} isLandscape={isLandscape} />
        </div>
      </div>
    </div>
  );
}
