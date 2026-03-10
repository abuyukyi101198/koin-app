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
        "relative overflow-hidden rounded-sm border bg-background transition-colors duration-150",
        {
          // idle with coin
          "border-border hover:bg-accent/60": coin && !isActiveDrag && !isOver,
          // idle without coin
          "border-border border-dashed": !coin && !isActiveDrag && !isOver,
          // drop target
          "bg-primary/5": isOver && !isActiveDrag,
          // ghost source slot
          "border-dashed border-muted-foreground/30 bg-muted/20": isActiveDrag,
        }
      )}
      ref={setNodeRef}
      role="gridcell"
    >
      {/* Ghost silhouette while dragging */}
      {isActiveDrag && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" />
      )}

      {coin && !isActiveDrag ? <NotebookDraggable coin={coin} id={id} /> : null}
    </div>
  );
}
