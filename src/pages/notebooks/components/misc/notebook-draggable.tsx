import { cn } from "@/lib/utils.ts";
import { NotebookCoin } from "@/pages/notebooks/components/misc/notebook-coin.tsx";
import { Coin } from "@/query/types";

interface NotebookDraggableProps {
  coin: Coin;
  isSelected?: boolean;
  handActive?: boolean;
  onSelect?: (coinId: number) => void;
  onPickUp?: (coin: Coin, position: { x: number; y: number }) => void;
}

export function NotebookDraggable({
  coin,
  isSelected = false,
  handActive = false,
  onSelect,
  onPickUp,
}: NotebookDraggableProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-start justify-center rounded-sm",
        "transition-all duration-100",
        !handActive && "cursor-pointer hover:bg-muted/60"
      )}
      onClick={(e) => {
        if (!handActive) {
          e.stopPropagation();
          onSelect?.(coin.id);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPickUp?.(coin, { x: e.clientX, y: e.clientY });
      }}
    >
      <NotebookCoin coin={coin} isSelected={isSelected} />
    </div>
  );
}
