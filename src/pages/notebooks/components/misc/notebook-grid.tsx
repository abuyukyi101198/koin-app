import { CSSProperties, useCallback, useEffect, useState } from "react";

import { HandCoins, X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { NotebookDragOverlay } from "@/pages/notebooks/components/misc/notebook-coin-overlay.tsx";
import { NotebookSlot } from "@/pages/notebooks/components/misc/notebook-slot.tsx";
import { useNotebookReorderContext } from "@/pages/notebooks/context/notebook-reorder-context.tsx";
import { SlotClickPayload, SlotCoordinates } from "@/pages/notebooks/types.ts";
import { Coin, Notebook } from "@/query/types";

export type { SlotCoordinates };

function slotId({ pageIndex, rowIdx, colIdx }: SlotCoordinates): string {
  return `${pageIndex}-${rowIdx}-${colIdx}`;
}

interface NotebookGridProps {
  notebook: Notebook;
  page: number;
}

export function NotebookGrid({ notebook, page }: NotebookGridProps) {
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const { rows_per_page: rows, columns_per_page: cols } = notebook;
  const pageIndex = page - 1;

  const {
    hand,
    isActive: handActive,
    topCoin,
    topOrigin,
    localCells,
    pickUp,
    place,
    discard,
    placingRef,
  } = useNotebookReorderContext();

  // When a slot handles a valid placement it flips this ref to true so the
  // window click listener — which fires on the same event after React's
  // synthetic handlers — knows to skip its place(null) call.

  // Track cursor position for the drag overlay
  useEffect(() => {
    if (!handActive) {
      setCursor(null);
      return;
    }
    const onMove = (e: PointerEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, [handActive]);

  // Global left-click outside a slot → place(null) = discard top coin.
  // Runs after React's synthetic handlers so slotHandledRef is already set.
  useEffect(() => {
    if (!handActive) return;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (placingRef.current) {
        placingRef.current = false;
        return;
      }
      place(null);
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [handActive, place, placingRef]);

  // Escape key → discard entire hand
  useEffect(() => {
    if (!handActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") discard();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handActive, discard]);

  const handlePickUp = useCallback(
    (coin: Coin) => {
      pickUp(coin, "grid");
    },
    [pickUp]
  );

  const handlePlace = useCallback(
    (payload: SlotClickPayload) => {
      if (!handActive) return;
      placingRef.current = true;
      place(payload);
    },
    [handActive, place, placingRef]
  );

  const dropLabel = topOrigin === "grid" ? "Unassign" : "Discard";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="shrink-0 h-8 flex items-center gap-2 px-6 py-2 border-b bg-muted/30 text-sm">
        {handActive ? (
          <>
            <HandCoins className="size-4 shrink-0" />
            <span className="text-muted-foreground">
              Holding{" "}
              <span className="font-medium text-foreground">{hand.length}</span>{" "}
              coin{hand.length !== 1 ? "s" : ""} —{" "}
              <span className="font-medium text-foreground">
                {topCoin?.title ?? ""}
              </span>{" "}
              on top
            </span>
            <span className="ml-auto flex items-center gap-1">
              <Button
                className="h-6 gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  placingRef.current = true;
                  place(null);
                }}
                size="xs"
                variant="ghost"
              >
                <X className="size-3" />
                {dropLabel} top
              </Button>
              <Button
                className="h-6 gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  placingRef.current = true;
                  discard();
                }}
                size="xs"
                variant="ghost"
              >
                <X className="size-3" />
                Discard all
              </Button>
            </span>
          </>
        ) : (
          <span className="text-muted-foreground text-xs">
            Right-click a coin to pick it up
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex-1 grid gap-2 p-6 pt-4 max-h-full",
          handActive && "cursor-none"
        )}
        role="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {(localCells[pageIndex] ?? []).map((row, rowIdx) =>
          row.map((coin, colIdx) => {
            const coords: SlotCoordinates = { pageIndex, rowIdx, colIdx };
            const id = slotId(coords);
            return (
              <NotebookSlot
                coin={coin}
                coordinates={coords}
                handActive={handActive}
                isSelected={false}
                key={id}
                onPickUp={handlePickUp}
                onPlace={handlePlace}
              />
            );
          })
        )}
      </div>

      {/* Cursor-following drag overlay */}
      {handActive &&
        topCoin &&
        cursor &&
        createPortal(
          <div
            className="pointer-events-none fixed -translate-x-2 -translate-y-2 z-50 h-[calc((100vh-62*var(--spacing))/var(--rows))] w-[calc((7/12*100vw-3rem-(var(--cols)-1)*2*var(--spacing))/var(--cols))] scale-90"
            style={
              {
                "--rows": rows,
                "--cols": cols,
                left: cursor.x,
                top: cursor.y,
              } as CSSProperties
            }
          >
            <NotebookDragOverlay
              coin={topCoin}
              isSelected
              stackCount={hand.length}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
