import { CSSProperties, useCallback, useEffect } from "react";

import { createPortal } from "react-dom";

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
  const { rows_per_page: rows, columns_per_page: cols } = notebook;
  const pageIndex = page - 1;

  const {
    hand,
    isActive: handActive,
    topCoin,
    localCells,
    pickUp,
    place,
    placingRef,
    cursor,
    setCursor,
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
  }, [handActive, setCursor]);

  // Global left-click outside a slot → place(null) = discard top coin.
  // Runs after React's synthetic handlers so placingRef is already set.
  useEffect(() => {
    if (!handActive) return;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      // If a slot or explicit UI handler already consumed this click, skip.
      if (placingRef.current) {
        placingRef.current = false;
        return;
      }
      // Do not discard when clicking interactive UI elements (buttons,
      // inputs, pagination, etc.) — only bare canvas/empty space triggers a drop.
      const target = e.target as HTMLElement;
      if (
        target.closest("button, a, input, select, textarea, [role='button']")
      ) {
        return;
      }
      place(null);
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [handActive, place, placingRef]);

  const handlePickUp = useCallback(
    (coin: Coin, pos: { x: number; y: number }) => {
      setCursor(pos);
      pickUp(coin, "grid");
    },
    [pickUp, setCursor]
  );

  const handlePlace = useCallback(
    (payload: SlotClickPayload) => {
      if (!handActive) return;
      placingRef.current = true;
      place(payload);
    },
    [handActive, place, placingRef]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        className="flex-1 grid gap-2 p-6 pt-4 max-h-full"
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
