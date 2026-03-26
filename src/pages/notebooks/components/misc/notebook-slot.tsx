import { cn } from "@/lib/utils.ts";
import { NotebookDraggable } from "@/pages/notebooks/components/misc/notebook-draggable.tsx";
import { SlotClickPayload, SlotCoordinates } from "@/pages/notebooks/types.ts";
import { Coin } from "@/query/types";

interface NotebookSlotProps {
  coordinates: SlotCoordinates;
  coin: Coin | null;
  isSelected?: boolean;
  handActive?: boolean;
  onPickUp?: (coin: Coin) => void;
  onPlace?: (payload: SlotClickPayload) => void;
}

export function NotebookSlot({
  coordinates,
  coin,
  isSelected = false,
  handActive = false,
  onPickUp,
  onPlace,
}: NotebookSlotProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border bg-background transition-colors duration-150",
        {
          "border-border hover:bg-accent/60": coin && !handActive,
          "border-border border-dashed": !coin && !handActive,
          "hover:bg-accent/60 cursor-cell": handActive && !coin,
          "cursor-none": handActive && coin,
        }
      )}
      onClick={(e) => {
        if (!handActive) return;
        // placingRef is set by handlePlace in the grid before place() is called,
        // so the window click listener will skip place(null) for this event.
        e.stopPropagation();
        onPlace?.({ coordinates, coin });
      }}
      role="gridcell"
    >
      {coin && (
        <NotebookDraggable
          coin={coin}
          handActive={handActive}
          isSelected={isSelected}
          onPickUp={onPickUp}
        />
      )}
    </div>
  );
}
