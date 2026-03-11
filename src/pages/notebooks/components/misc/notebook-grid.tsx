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

import { NotebookDragOverlay } from "@/pages/notebooks/components/misc/notebook-coin-overlay.tsx";
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
  selectedIds: Set<number>;
  onSelect: (coinId: number) => void;
}

export function NotebookGrid({
  notebook,
  page,
  selectedIds,
  onSelect,
}: NotebookGridProps) {
  const reorderCoinsMutation = useReorderCoins();
  const { rows_per_page: rows, columns_per_page: cols, cells } = notebook;
  const pageIndex = page - 1;

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const activeCoin = useMemo<Coin | null>(() => {
    if (!activeDragId) return null;
    const { pageIndex: pi, rowIdx: ri, colIdx: ci } = parseSlotId(activeDragId);
    const draggedCoin = cells[pi]?.[ri]?.[ci] ?? null;

    if (
      draggedCoin &&
      selectedIds.has(draggedCoin.id) &&
      selectedIds.size > 1
    ) {
      let lowestCoin: Coin | null = null;
      cells.forEach((page) => {
        page.forEach((row) => {
          row.forEach((coin) => {
            if (!coin || !selectedIds.has(coin.id)) return;
            if (
              lowestCoin === null ||
              (coin.notebook_position ?? Infinity) <
                (lowestCoin.notebook_position ?? Infinity)
            ) {
              lowestCoin = coin;
            }
          });
        });
      });
      return lowestCoin;
    }

    return draggedCoin;
  }, [activeDragId, cells, selectedIds]);

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
      const totalSlots = cells.length * cellsPerPage;

      const toFlat = (pi: number, ri: number, ci: number) =>
        pi * cellsPerPage + ri * cols + ci;
      const fromFlat = (pos: number): SlotCoordinates => ({
        pageIndex: Math.floor(pos / cellsPerPage),
        rowIdx: Math.floor((pos % cellsPerPage) / cols),
        colIdx: pos % cols,
      });

      // Build flat ordered list of all coins with their current positions
      const allCoins: { coin: Coin; pos: number }[] = [];
      cells.forEach((page, pi) => {
        page.forEach((row, ri) => {
          row.forEach((coin, ci) => {
            if (coin) allCoins.push({ coin, pos: toFlat(pi, ri, ci) });
          });
        });
      });

      const draggedCoinId = activeCoin?.id;
      const isMultiDrag =
        draggedCoinId !== undefined &&
        selectedIds.has(draggedCoinId) &&
        selectedIds.size > 1;

      const allCoinsResult: { coin_id: number; position: number }[] = [];

      if (isMultiDrag) {
        // Split into selected (ordered by current pos) and unselected
        const selected = allCoins
          .filter((c) => selectedIds.has(c.coin.id))
          .sort((a, b) => a.pos - b.pos);
        const unselected = allCoins.filter((c) => !selectedIds.has(c.coin.id));

        // Find free slots starting at the target flat position
        const occupiedByUnselected = new Set(unselected.map((c) => c.pos));
        const freeSlots: number[] = [];
        for (
          let i = 0;
          i < totalSlots && freeSlots.length < selected.length;
          i++
        ) {
          const candidate =
            (toFlat(to.pageIndex, to.rowIdx, to.colIdx) + i) % totalSlots;
          if (!occupiedByUnselected.has(candidate)) freeSlots.push(candidate);
        }

        selected.forEach(({ coin }, i) => {
          allCoinsResult.push({ coin_id: coin.id, position: freeSlots[i] });
        });
        unselected.forEach(({ coin, pos }) => {
          allCoinsResult.push({ coin_id: coin.id, position: pos });
        });
      } else {
        // Simple two-slot swap
        allCoins.forEach(({ coin, pos }) => {
          const coords = fromFlat(pos);
          const isFrom =
            coords.pageIndex === from.pageIndex &&
            coords.rowIdx === from.rowIdx &&
            coords.colIdx === from.colIdx;
          const isTo =
            coords.pageIndex === to.pageIndex &&
            coords.rowIdx === to.rowIdx &&
            coords.colIdx === to.colIdx;

          const dest = isFrom ? to : isTo ? from : coords;
          allCoinsResult.push({
            coin_id: coin.id,
            position: toFlat(dest.pageIndex, dest.rowIdx, dest.colIdx),
          });
        });
      }

      reorderCoinsMutation.mutate(
        { notebook_id: notebook.id, coins: allCoinsResult },
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
    [
      activeCoin?.id,
      cells,
      cols,
      notebook.id,
      reorderCoinsMutation,
      rows,
      selectedIds,
    ]
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
              const isActiveDrag = activeDragId === id;
              const isMultiDragGhost =
                activeDragId !== null &&
                coin !== null &&
                selectedIds.has(coin.id) &&
                activeCoin !== null &&
                selectedIds.has(activeCoin.id) &&
                selectedIds.size > 1;
              return (
                <NotebookSlot
                  coin={coin}
                  coordinates={coords}
                  id={id}
                  isActiveDrag={isActiveDrag || isMultiDragGhost}
                  isSelected={coin !== null && selectedIds.has(coin.id)}
                  key={id}
                  onSelect={onSelect}
                />
              );
            })
          )}
        </div>

        <DragOverlay>
          {activeCoin && (
            <NotebookDragOverlay
              coin={activeCoin}
              isSelected={selectedIds.has(activeCoin.id)}
              stackCount={selectedIds.has(activeCoin.id) ? selectedIds.size : 1}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
