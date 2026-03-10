import { useCallback, useMemo, useState } from "react";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { NotebookCoin } from "@/pages/notebooks/components/misc/notebook-coin.tsx";
import { NotebookSlot } from "@/pages/notebooks/components/misc/notebook-slot.tsx";
import { useReorderCoins } from "@/query/commands";
import { Coin, Notebook } from "@/query/types";

export interface SlotCoordinates {
  pageIndex: number;
  rowIdx: number;
  colIdx: number;
}

function slotId({ pageIndex, rowIdx, colIdx }: SlotCoordinates): string {
  return `${pageIndex}-${rowIdx}-${colIdx}`;
}

function parseSlotId(id: string): SlotCoordinates {
  const [pageIndex, rowIdx, colIdx] = id.split("-").map(Number);
  return { pageIndex, rowIdx, colIdx };
}

interface NotebookGridProps {
  notebook: Notebook;
  page: number;
}

export function NotebookGrid({ notebook, page }: NotebookGridProps) {
  const reorderCoinsMutation = useReorderCoins();
  const { rows_per_page: rows, columns_per_page: cols, cells } = notebook;
  const pageIndex = page - 1;

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const activeCoin = useMemo<Coin | null>(() => {
    if (!activeDragId) return null;
    const { pageIndex: pi, rowIdx: ri, colIdx: ci } = parseSlotId(activeDragId);
    return cells[pi]?.[ri]?.[ci] ?? null;
  }, [activeDragId, cells]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveDragId(String(active.id));
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        setActiveDragId(null);
        return;
      }

      const from = parseSlotId(String(active.id));
      const to = over.data.current as SlotCoordinates;

      if (!to) {
        setActiveDragId(null);
        return;
      }

      const cellsPerPage = rows * cols;

      const toPosition = (pi: number, ri: number, ci: number) =>
        pi * cellsPerPage + ri * cols + ci;

      const allCoins: { coin_id: number; position: number }[] = [];

      cells.forEach((page, pi) => {
        page.forEach((row, ri) => {
          row.forEach((coin, ci) => {
            if (!coin) return;

            const isFrom =
              pi === from.pageIndex && ri === from.rowIdx && ci === from.colIdx;
            const isTo =
              pi === to.pageIndex && ri === to.rowIdx && ci === to.colIdx;

            const dest = isFrom
              ? to
              : isTo
                ? from
                : { pageIndex: pi, rowIdx: ri, colIdx: ci };

            allCoins.push({
              coin_id: coin.id,
              position: toPosition(dest.pageIndex, dest.rowIdx, dest.colIdx),
            });
          });
        });
      });

      reorderCoinsMutation.mutate(
        { notebook_id: notebook.id, coins: allCoins },
        {
          onSuccess: () => {
            setActiveDragId(null);
          },
          onError: () => {
            setActiveDragId(null);
          },
        }
      );
    },
    [cells, cols, notebook.id, reorderCoinsMutation, rows]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div
          className="flex-1 grid gap-2 p-6 pt-4 max-h-full"
          role="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {cells[pageIndex].map((row, rowIdx) =>
            row.map((coin, colIdx) => {
              const coords: SlotCoordinates = { pageIndex, rowIdx, colIdx };
              const id = slotId(coords);
              return (
                <NotebookSlot
                  coin={coin}
                  coordinates={coords}
                  id={id}
                  isActiveDrag={activeDragId === id}
                  key={id}
                />
              );
            })
          )}
        </div>

        <DragOverlay>
          {activeCoin && (
            <div className="relative flex items-start justify-center overflow-hidden rounded-sm border border-border bg-background shadow-xl opacity-95 w-full h-full">
              <NotebookCoin coin={activeCoin} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
