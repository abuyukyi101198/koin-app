import { useDroppable } from "@dnd-kit/core";

import { cn } from "@/lib/utils.ts";
import { NotebookDraggable } from "@/pages/notebooks/components/misc/notebook-draggable.tsx";
import { SlotCoordinates } from "@/pages/notebooks/components/misc/notebook-grid.tsx";
import { Coin } from "@/query/types";

interface NotebookSlotProps {
  id: string;
  coordinates: SlotCoordinates;
  coin: Coin | null;
  isActiveDrag?: boolean;
}

export function NotebookSlot({
  id,
  coordinates,
  coin,
  isActiveDrag = false,
}: NotebookSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: coordinates });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-border bg-background",
        {
          "ring-2 ring-primary ring-offset-1": isOver && !isActiveDrag,
          "opacity-0 pointer-events-none": isActiveDrag,
        }
      )}
      ref={setNodeRef}
      role="gridcell"
    >
      {coin && !isActiveDrag ? <NotebookDraggable coin={coin} id={id} /> : null}
    </div>
  );
}
