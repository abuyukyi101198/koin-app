import { cn } from "@/lib/utils.ts";
import { NotebookDraggable } from "@/pages/notebooks/components/misc/notebook-draggable.tsx";
import { SlotCoordinates } from "@/pages/notebooks/components/misc/notebook-grid.tsx";
import { SlotClickPayload } from "@/pages/notebooks/hooks/use-notebook-reorder.tsx";
import { Coin } from "@/query/types";

interface NotebookSlotProps {
  coordinates: SlotCoordinates;
  coin: Coin | null;
  isSelected?: boolean;
  handActive?: boolean;
  onSelect?: (coinId: number) => void;
  onPickUp?: (coin: Coin, position: { x: number; y: number }) => void;
  onPlace?: (payload: SlotClickPayload) => void;
}

export function NotebookSlot({
  coordinates,
  coin,
  isSelected = false,
  handActive = false,
  onSelect,
  onPickUp,
  onPlace,
}: NotebookSlotProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border bg-background transition-colors duration-150",
        {
          // idle with coin
          "border-border hover:bg-accent/60": coin && !handActive,
          // idle without coin
          "border-border border-dashed": !coin && !handActive,
          // hand active: all slots are potential placement targets
          "hover:bg-accent/60 cursor-cell": handActive,
        }
      )}
      onClick={() => {
        if (handActive) onPlace?.({ coordinates, coin });
      }}
      role="gridcell"
    >
      {coin && (
        <NotebookDraggable
          coin={coin}
          handActive={handActive}
          isSelected={isSelected}
          onPickUp={onPickUp}
          onSelect={handActive ? undefined : onSelect}
        />
      )}
    </div>
  );
}
