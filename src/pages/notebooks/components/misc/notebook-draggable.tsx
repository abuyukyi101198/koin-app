import { useDraggable } from "@dnd-kit/core";

import { cn } from "@/lib/utils.ts";
import { NotebookCoin } from "@/pages/notebooks/components/misc/notebook-coin.tsx";
import { Coin } from "@/query/types";

interface NotebookDraggableProps {
  id: string;
  coin: Coin;
  isSelected?: boolean;
  onSelect?: (coinId: number) => void;
}

export function NotebookDraggable({
  id,
  coin,
  isSelected = false,
  onSelect,
}: NotebookDraggableProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { coin } satisfies { coin: Coin },
  });

  return (
    <div
      {...attributes}
      {...listeners}
      className={cn(
        "absolute inset-0 flex items-start justify-center rounded-sm",
        "cursor-grab active:cursor-grabbing hover:bg-muted/60",
        "transition-all duration-100 active:scale-95"
      )}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onSelect?.(coin.id);
        }
      }}
      ref={setNodeRef}
    >
      <NotebookCoin coin={coin} isSelected={isSelected} />
    </div>
  );
}
