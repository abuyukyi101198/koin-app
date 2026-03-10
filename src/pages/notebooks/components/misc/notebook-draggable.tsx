import { useDraggable } from "@dnd-kit/core";

import { cn } from "@/lib/utils.ts";
import { NotebookCoin } from "@/pages/notebooks/components/misc/notebook-coin.tsx";
import { Coin } from "@/query/types";

interface NotebookDraggableProps {
  id: string;
  coin: Coin;
}

export function NotebookDraggable({ id, coin }: NotebookDraggableProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { coin } satisfies { coin: Coin },
  });

  return (
    <div
      {...attributes}
      {...listeners}
      className={cn(
        "absolute inset-0 flex items-start justify-center cursor-grab active:cursor-grabbing",
        { "opacity-0": isDragging }
      )}
      ref={setNodeRef}
    >
      <NotebookCoin coin={coin} />
    </div>
  );
}
