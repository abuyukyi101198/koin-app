import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

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
  notebook: Notebook | undefined;
  page: number;
  loading: boolean;
}

export function NotebookGrid({ notebook, page, loading }: NotebookGridProps) {
  const rows = notebook?.rows_per_page ?? 5;
  const cols = notebook?.columns_per_page ?? 4;
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

  // Compute slot landscape once for the whole grid to avoid per-coin flicker on pagination.
  const gridRef = useRef<HTMLDivElement>(null);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Each slot is (width / cols) × (height / rows); landscape when width/cols > 1.5 * height/rows
      setIsLandscape(width * rows > 1.5 * height * cols);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [rows, cols]);

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
      {loading ? (
        <div
          className="flex-1 grid gap-2 pt-4 pb-6 max-h-full"
          ref={gridRef}
          role="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => (
            <NotebookSlot.Skeleton isLandscape={isLandscape} key={i} />
          ))}
        </div>
      ) : (
        <div
          className="flex-1 grid gap-2 pt-4 pb-6 max-h-full"
          ref={gridRef}
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
              const slotNumber =
                pageIndex * rows * cols + rowIdx * cols + colIdx + 1;
              return (
                <NotebookSlot
                  coin={coin}
                  coordinates={coords}
                  handActive={handActive}
                  isLandscape={isLandscape}
                  isSelected={false}
                  key={id}
                  onPickUp={handlePickUp}
                  onPlace={handlePlace}
                  slotNumber={slotNumber}
                />
              );
            })
          )}
        </div>
      )}

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
              isLandscape={isLandscape}
              isSelected
              stackCount={hand.length}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
