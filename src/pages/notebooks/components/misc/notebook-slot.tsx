import { CoinPreviewImages } from "@/components/composite/coin-preview-images.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { NotebookDraggable } from "@/pages/notebooks/components/misc/notebook-draggable.tsx";
import { SlotClickPayload, SlotCoordinates } from "@/pages/notebooks/types.ts";
import { Coin } from "@/query/types";

interface NotebookSlotProps {
  coordinates: SlotCoordinates;
  coin: Coin | null;
  slotNumber: number;
  handActive?: boolean;
  isLandscape?: boolean;
  onPickUp?: (coin: Coin, pos: { x: number; y: number }) => void;
  onPlace?: (payload: SlotClickPayload) => void;
}

export function NotebookSlot({
  coordinates,
  coin,
  slotNumber,
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
          onPickUp={onPickUp}
        />
      )}
    </div>
  );
}

NotebookSlot.Skeleton = ({
  isLandscape = false,
}: Pick<NotebookSlotProps, "isLandscape">) => {
  return (
    <div
      className="relative overflow-hidden rounded-sm border bg-background border-border"
      role="gridcell"
    >
      {/* Three-digit slot number */}
      <Skeleton className="absolute h-3 w-4.5 top-1.5 left-1.5 z-10 rounded-sm" />

      <div
        className={cn(
          "absolute inset-0 flex items-start justify-center rounded-sm"
        )}
      >
        <div className="absolute inset-2">
          <div
            className={cn(
              "h-full w-full flex",
              isLandscape
                ? "flex-row items-center gap-2"
                : "flex-col items-center justify-center gap-1"
            )}
          >
            <div className="h-full flex items-center justify-center overflow-hidden p-2 aspect-square">
              <CoinPreviewImages.Skeleton display="obverse" />
            </div>

            <Separator orientation={isLandscape ? "vertical" : "horizontal"} />
            <div
              className={cn(
                "flex flex-col",
                isLandscape
                  ? "h-full pt-2 justify-center items-start flex-1 gap-1"
                  : "items-center w-full gap-1"
              )}
            >
              <Skeleton className="absolute top-0 right-0 h-3 w-4.5 shrink-0 rounded" />
              <Skeleton className="pb-0.5 h-3 w-8 rounded" />
              <Skeleton className="h-2.25 w-4 rounded" />
              <Skeleton
                className={cn("h-4.5 rounded", isLandscape ? "w-full" : "w-12")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
