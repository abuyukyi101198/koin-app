import { cn } from "@/lib/utils.ts";
import { NotebookDraggable } from "@/pages/notebooks/components/misc/notebook-draggable.tsx";
import { SlotClickPayload, SlotCoordinates } from "@/pages/notebooks/types.ts";
import { Coin } from "@/query/types";

interface NotebookSlotProps {
  coordinates: SlotCoordinates;
  coin: Coin | null;
  slotNumber: number;
  isSelected?: boolean;
  handActive?: boolean;
  isLandscape?: boolean;
  onPickUp?: (coin: Coin, pos: { x: number; y: number }) => void;
  onPlace?: (payload: SlotClickPayload) => void;
}

export function NotebookSlot({
  coordinates,
  coin,
  slotNumber,
  isSelected = false,
  handActive = false,
  isLandscape = false,
  onPickUp,
  onPlace,
}: NotebookSlotProps) {
  const label = String(slotNumber).padStart(3, "0");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border bg-background transition-colors duration-150 hover:bg-muted",
        {
          "border-border": !handActive,
          "cursor-cell": handActive,
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
      {/* Three-digit slot number */}
      <span className="absolute top-1.5 left-1.5 z-10 text-xs text-muted-foreground leading-none select-none pointer-events-none tabular-nums">
        {label}
      </span>

      {/* Double-border stitched effect for empty slots */}
      {!coin && (
        <div className="absolute inset-0.75 rounded-[2px] border border-dashed pointer-events-none" />
      )}

      {coin && (
        <NotebookDraggable
          coin={coin}
          handActive={handActive}
          isLandscape={isLandscape}
          isSelected={isSelected}
          onPickUp={onPickUp}
        />
      )}
    </div>
  );
}
