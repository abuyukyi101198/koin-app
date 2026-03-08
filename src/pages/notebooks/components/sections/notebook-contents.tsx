import { useMemo, useState } from "react";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import usePagination from "@/hooks/use-pagination.ts";
import { cn } from "@/lib/utils.ts";
import { useGetNotebook, useReorderCoins } from "@/query/commands/notebooks.ts";
import { Coin } from "@/query/types";
import { asFraction } from "@/utils/asFraction.tsx";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlotCoords {
  pageIndex: number;
  rowIdx: number;
  colIdx: number;
}

function slotId(pageIndex: number, rowIdx: number, colIdx: number) {
  return `${pageIndex}-${rowIdx}-${colIdx}`;
}

// ─── Draggable coin ───────────────────────────────────────────────────────────

function DraggableNotebookCoin({
  coin,
  id,
  isOverlay = false,
}: {
  coin: Coin;
  id: string;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { coin } satisfies { coin: Coin },
  });

  return (
    <div
      {...attributes}
      {...listeners}
      className={cn(
        "absolute inset-0 flex items-start justify-center cursor-grab active:cursor-grabbing",
        isDragging && !isOverlay && "opacity-0"
      )}
      ref={setNodeRef}
    >
      <NotebookCoinInner coin={coin} />
    </div>
  );
}

// ─── Inner coin rendering (pure visual) ──────────────────────────────────────

function NotebookCoinInner({ coin }: { coin: Coin }) {
  return (
    <>
      <div className="flex gap-2 mt-auto mb-auto px-2">
        <div className="aspect-square flex items-center justify-center">
          {coin.reverse_image ? (
            <img
              alt="Coin reverse"
              className="max-w-full max-h-full object-contain rounded-full"
              draggable={false}
              src={coin.reverse_image}
            />
          ) : (
            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
              R
            </div>
          )}
        </div>
        <div className="aspect-square flex items-center justify-center">
          {coin.obverse_image ? (
            <img
              alt="Coin obverse"
              className="max-w-full max-h-full object-contain rounded-full"
              draggable={false}
              src={coin.obverse_image}
            />
          ) : (
            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
              O
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end absolute bottom-0 w-full text-xs py-1 px-3 backdrop-blur-2xl">
        <img
          alt={`${coin.issuer.name} flag`}
          className="h-3 w-4.5 mt-0.5"
          draggable={false}
          loading="lazy"
          src={coin.issuer.flag?.length ? coin.issuer.flag : undefined}
        />
        <span className="text-xs font-medium">
          {asFraction(coin.title, coin.value)}
        </span>
      </div>
    </>
  );
}

// ─── Droppable slot ───────────────────────────────────────────────────────────

function DroppableSlot({
  id,
  coords,
  coin,
  isActiveDrag = false,
}: {
  id: string;
  coords: SlotCoords;
  coin: Coin | null;
  isActiveDrag?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: coords });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-border bg-background",
        isOver && !isActiveDrag && "ring-2 ring-primary ring-offset-1",
        isActiveDrag && "opacity-0 pointer-events-none"
      )}
      ref={setNodeRef}
      role="gridcell"
    >
      {coin && !isActiveDrag ? (
        <DraggableNotebookCoin coin={coin} id={id} />
      ) : null}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface NotebookContentsProps {
  notebookId: number;
}

export function NotebookContents({ notebookId }: NotebookContentsProps) {
  const { page, setPage } = usePagination();
  const { data: notebook, isLoading } = useGetNotebook({ id: notebookId });
  const reorderCoinsMutation = useReorderCoins();

  const rows = notebook?.rows_per_page ?? 1;
  const cols = notebook?.columns_per_page ?? 1;

  // Zero-based page index for array access
  const pageIndex = page - 1;

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const activeCoin = useMemo<Coin | null>(() => {
    if (!activeDragId || !notebook) return null;
    const [pi, ri, ci] = activeDragId.split("-").map(Number);
    return notebook.cells[pi]?.[ri]?.[ci] ?? null;
  }, [activeDragId, notebook]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveDragId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !notebook) {
      setActiveDragId(null);
      return;
    }

    const [fromPi, fromRi, fromCi] = String(active.id).split("-").map(Number);
    const to = over.data.current as SlotCoords;
    if (!to) {
      setActiveDragId(null);
      return;
    }

    const cellsPerPage = rows * cols;

    // Build full position map swapping the two slots
    const allCoins: { coin_id: number; position: number }[] = [];
    notebook.cells.forEach((pageCells, pi) => {
      pageCells.forEach((row, ri) => {
        row.forEach((coin, ci) => {
          if (!coin) return;
          let ePi = pi,
            eRi = ri,
            eCi = ci;

          if (pi === fromPi && ri === fromRi && ci === fromCi) {
            ePi = to.pageIndex;
            eRi = to.rowIdx;
            eCi = to.colIdx;
          } else if (
            pi === to.pageIndex &&
            ri === to.rowIdx &&
            ci === to.colIdx
          ) {
            ePi = fromPi;
            eRi = fromRi;
            eCi = fromCi;
          }

          allCoins.push({
            coin_id: coin.id,
            position: ePi * cellsPerPage + eRi * cols + eCi,
          });
        });
      });
    });

    reorderCoinsMutation.mutate(
      { notebook_id: notebookId, coins: allCoins },
      {
        onSuccess: () => {
          setActiveDragId(null);
        },
        onError: () => {
          setActiveDragId(null);
        },
      }
    );
  };

  return (
    <section
      aria-busy={isLoading}
      aria-label="Notebook contents"
      className="h-full w-7/12 flex flex-col overflow-hidden border-r"
    >
      {/* Header */}
      <header className="shrink-0 border-b px-6 pt-8 pb-3">
        <h2 className="text-2xl font-medium tracking-wide">
          {notebook?.title}
        </h2>
        <p className="text-lg italic text-muted-foreground">
          {notebook?.description || "—"}
        </p>
      </header>

      {/* Grid */}
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
            {notebook?.cells[pageIndex].map((row, rowIdx) =>
              row.map((coin, colIdx) => {
                const id = slotId(pageIndex, rowIdx, colIdx);
                return (
                  <DroppableSlot
                    coin={coin}
                    coords={{ pageIndex, rowIdx, colIdx }}
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
                <NotebookCoinInner coin={activeCoin} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <div aria-atomic="true" aria-live="polite">
        <DataTablePagination
          onPaginationChange={async (pageIndex) => {
            setPage(pageIndex);
          }}
          pageCount={notebook?.number_of_pages ?? 1}
          pageIndex={page}
        />
      </div>
    </section>
  );
}
