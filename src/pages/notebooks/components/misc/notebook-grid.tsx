import { CSSProperties, useCallback, useEffect, useState } from "react";

import { HandCoins, X } from "lucide-react";
import { createPortal } from "react-dom";

import {
  SlotClickPayload,
  useNotebookReorder,
} from "../../hooks/use-notebook-reorder";

import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { NotebookDragOverlay } from "@/pages/notebooks/components/misc/notebook-coin-overlay.tsx";
import { NotebookSlot } from "@/pages/notebooks/components/misc/notebook-slot.tsx";
import { Coin, Notebook } from "@/query/types";

export interface SlotCoordinates {
  pageIndex: number;
  rowIdx: number;
  colIdx: number;
}

function slotId({ pageIndex, rowIdx, colIdx }: SlotCoordinates): string {
  return `${pageIndex}-${rowIdx}-${colIdx}`;
}

interface NotebookGridProps {
  notebook: Notebook;
  page: number;
}

export function NotebookGrid({ notebook, page }: NotebookGridProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const { rows_per_page: rows, columns_per_page: cols } = notebook;
  const pageIndex = page - 1;

  const {
    hand,
    isActive: handActive,
    topCoin,
    localCells,
    pickUp,
    place,
    discard,
  } = useNotebookReorder({ notebook });

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

  const onSelect = useCallback((coinId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(coinId) ? next.delete(coinId) : next.add(coinId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handlePickUp = useCallback(
    (coin: Coin, position: { x: number; y: number }) => {
      setCursor(position);
      pickUp(coin);
    },
    [pickUp]
  );

  const handlePlace = useCallback(
    (payload: SlotClickPayload) => {
      if (!handActive) return;
      place(payload);
    },
    [handActive, place]
  );

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
            <Button
              className="ml-auto h-6 gap-1 text-xs"
              onClick={discard}
              size="xs"
              variant="ghost"
            >
              <X className="size-3" />
              Discard
            </Button>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {selectedIds.size}
              </span>{" "}
              selected
            </span>
            {selectedIds.size > 0 && (
              <Button
                className="ml-auto h-6 gap-1 text-xs"
                onClick={clearSelection}
                size="xs"
                variant="ghost"
              >
                <X className="size-3" />
                Clear
              </Button>
            )}
          </>
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
        {localCells[pageIndex].map((row, rowIdx) =>
          row.map((coin, colIdx) => {
            const coords: SlotCoordinates = { pageIndex, rowIdx, colIdx };
            const id = slotId(coords);
            return (
              <NotebookSlot
                coin={coin}
                coordinates={coords}
                handActive={handActive}
                isSelected={coin !== null && selectedIds.has(coin.id)}
                key={id}
                onPickUp={handlePickUp}
                onPlace={handlePlace}
                onSelect={onSelect}
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
