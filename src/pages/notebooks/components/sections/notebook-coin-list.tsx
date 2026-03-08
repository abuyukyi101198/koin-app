import { useEffect, useMemo, useState } from "react";

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
import { GripVertical, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { useGetNotebook, useReorderCoins } from "@/query/commands";
import { Coin } from "@/query/types/coins.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlotId {
  pageIndex: number;
  slotIndex: number;
}

function slotKey(pageIndex: number, slotIndex: number) {
  return `${pageIndex}-${slotIndex}`;
}

// ─── Draggable coin ───────────────────────────────────────────────────────────

function DraggableCoin({
  coin,
  slotId,
  isOverlay = false,
}: {
  coin: Coin;
  slotId: string;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: slotId,
    data: { coin },
  });

  return (
    <div
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-sm text-sm select-none",
        "cursor-grab active:cursor-grabbing hover:bg-accent/60 w-full",
        isDragging && !isOverlay && "opacity-30",
        isOverlay && "shadow-lg bg-popover border opacity-95"
      )}
      ref={setNodeRef}
    >
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
      <span className="truncate leading-snug flex-1">{coin.title}</span>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
        {coin.year}
      </span>
    </div>
  );
}

// ─── Droppable slot ───────────────────────────────────────────────────────────

function DroppableSlot({
  pageIndex,
  slotIndex,
  coin,
}: {
  pageIndex: number;
  slotIndex: number;
  coin: Coin | null;
}) {
  const id = slotKey(pageIndex, slotIndex);
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { pageIndex, slotIndex },
  });

  return (
    <li
      className={cn(
        "rounded-sm transition-colors min-h-8",
        !coin && "border border-dashed border-muted-foreground/20",
        isOver && "bg-accent/40 border-accent"
      )}
      ref={setNodeRef}
    >
      {coin ? (
        <DraggableCoin coin={coin} slotId={id} />
      ) : (
        <div className="px-2 py-1 h-full" />
      )}
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface NotebookCoinListProps {
  notebookId: number;
}

export function NotebookCoinList({ notebookId }: NotebookCoinListProps) {
  const { data: notebook, isLoading } = useGetNotebook({ id: notebookId });
  const reorderCoinsMutation = useReorderCoins();

  // pages[pageIndex][slotIndex] = Coin | null
  const pages = useMemo<(Coin | null)[][]>(() => {
    if (!notebook) return [];
    return notebook.cells.map((page) => page.flatMap((row) => row));
  }, [notebook]);

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // Collapse empty pages by default whenever pages change
  useEffect(() => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      pages.forEach((slots, pageIndex) => {
        const isEmpty = slots.every((c) => c === null);
        if (isEmpty) next.add(pageIndex);
        // Don't auto-expand non-empty pages the user may have closed
      });
      return next;
    });
  }, [pages]);

  const toggleCollapsed = (pageIndex: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(pageIndex) ? next.delete(pageIndex) : next.add(pageIndex);
      return next;
    });
  };

  // Track which slot is being dragged for the overlay
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const activeCoin = useMemo<Coin | null>(() => {
    if (!activeSlotId) return null;
    const [pi, si] = activeSlotId.split("-").map(Number);
    return pages[pi]?.[si] ?? null;
  }, [activeSlotId, pages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveSlotId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveSlotId(null);
    if (!over || active.id === over.id || !notebook) return;

    const fromData = active.data.current as SlotId & { coin: Coin };
    const toData = over.data.current as SlotId;
    if (!fromData || !toData) return;

    // Parse source and target from slot keys
    const [fromPage, fromSlot] = String(active.id).split("-").map(Number);
    const toPage = toData.pageIndex;
    const toSlot = toData.slotIndex;

    const cellsPerPage = notebook.rows_per_page * notebook.columns_per_page;

    // Build the full position map, swapping the two slots
    const allCoins: { coin_id: number; position: number }[] = [];
    pages.forEach((slots, pageIndex) => {
      slots.forEach((coin, slotIndex) => {
        if (!coin) return;
        let effectiveSlot = slotIndex;
        let effectivePage = pageIndex;

        if (pageIndex === fromPage && slotIndex === fromSlot) {
          effectivePage = toPage;
          effectiveSlot = toSlot;
        } else if (pageIndex === toPage && slotIndex === toSlot) {
          effectivePage = fromPage;
          effectiveSlot = fromSlot;
        }

        allCoins.push({
          coin_id: coin.id,
          position: effectivePage * cellsPerPage + effectiveSlot,
        });
      });
    });

    reorderCoinsMutation.mutate({ notebook_id: notebookId, coins: allCoins });
  };

  return (
    <section
      aria-label="Notebook pages and coins"
      className="flex-1 flex flex-col overflow-hidden border-t"
    >
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton className="h-6 w-full rounded-sm" key={i} />
            ))}
          </div>
        ) : (
          <DndContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            sensors={sensors}
          >
            <ul className="flex flex-col py-1">
              {pages.map((slots, pageIndex) => {
                const isOpen = !collapsed.has(pageIndex);
                const coinCount = slots.filter(Boolean).length;
                return (
                  <li key={pageIndex}>
                    <Collapsible
                      onOpenChange={() => {
                        toggleCollapsed(pageIndex);
                      }}
                      open={isOpen}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          className="w-full justify-start gap-1 px-2 py-1 h-auto text-xs font-semibold text-muted-foreground"
                          variant="ghost"
                        >
                          <ChevronRight
                            className={cn(
                              "size-3 shrink-0 transition-transform duration-150",
                              isOpen && "rotate-90"
                            )}
                          />
                          <span>Page {pageIndex + 1}</span>
                          <span className="ml-auto font-normal tabular-nums">
                            {coinCount}/{slots.length}
                          </span>
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <ul className="flex flex-col gap-0.5 px-2 py-1">
                          {slots.map((coin, slotIndex) => (
                            <DroppableSlot
                              coin={coin}
                              key={slotIndex}
                              pageIndex={pageIndex}
                              slotIndex={slotIndex}
                            />
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                );
              })}
            </ul>

            <DragOverlay>
              {activeCoin && (
                <DraggableCoin
                  coin={activeCoin}
                  isOverlay
                  slotId={activeSlotId!}
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </ScrollArea>
    </section>
  );
}
