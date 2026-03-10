import { useDraggable } from "@dnd-kit/core";

import { NotebookCoin } from "@/pages/notebooks/components/misc/notebook-coin.tsx";
import { Coin } from "@/query/types";

interface NotebookDraggableProps {
  id: string;
  coin: Coin;
}

export function NotebookDraggable({ id, coin }: NotebookDraggableProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data: { coin } satisfies { coin: Coin },
  });

  return (
    <div
      {...attributes}
      {...listeners}
      className="absolute inset-0 flex items-start justify-center cursor-grab active:cursor-grabbing transition-transform duration-100 active:scale-95"
      ref={setNodeRef}
    >
      <NotebookCoin coin={coin} />
    </div>
  );
}
