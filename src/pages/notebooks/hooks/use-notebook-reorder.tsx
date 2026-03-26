import { useCallback, useEffect, useState } from "react";

import { SlotCoordinates } from "@/pages/notebooks/components/misc/notebook-grid.tsx";
import { useReorderCoins } from "@/query/commands";
import { Coin, Notebook } from "@/query/types";

interface UseNotebookReorderProps {
  notebook: Notebook | undefined;
}

export interface SlotClickPayload {
  coordinates: SlotCoordinates;
  coin: Coin | null;
}

export function useNotebookReorder({ notebook }: UseNotebookReorderProps) {
  const reorderCoinsMutation = useReorderCoins();

  const [hand, setHand] = useState<Coin[]>([]);

  // Optimistic local copy of the grid cells.
  const [localCells, setLocalCells] = useState<(Coin | null)[][][]>(
    notebook?.cells ?? []
  );

  useEffect(() => {
    if (!notebook) return;
    setHand([]);
    setLocalCells(notebook.cells);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebook?.id]);

  // Keep localCells in sync with the server notebook whenever the hand is
  // empty (i.e. no reorder in progress). While the hand is active, own
  // the state locally to avoid server-response flashes.
  useEffect(() => {
    if (!notebook) return;
    if (hand.length === 0) {
      setLocalCells(notebook.cells);
    }
  }, [notebook, hand.length]);

  const isActive = hand.length > 0;

  const toFlat = useCallback(
    (pi: number, ri: number, ci: number) => {
      if (!notebook) return 0;
      const { rows_per_page: rows, columns_per_page: cols } = notebook;
      return pi * (rows * cols) + ri * cols + ci;
    },
    [notebook]
  );

  const buildPositions = useCallback(
    (
      cells: (Coin | null)[][][] = localCells
    ): { coin_id: number; position: number }[] => {
      const result: { coin_id: number; position: number }[] = [];
      cells.forEach((page, pi) => {
        page.forEach((row, ri) => {
          row.forEach((coin, ci) => {
            if (coin)
              result.push({ coin_id: coin.id, position: toFlat(pi, ri, ci) });
          });
        });
      });
      return result;
    },
    [localCells, toFlat]
  );

  const pickUp = useCallback(
    (coin: Coin) => {
      if (!notebook) return;
      // Remove the coin from localCells immediately.
      const nextCells = localCells.map((page) =>
        page.map((row) => row.map((c) => (c?.id === coin.id ? null : c)))
      );
      setLocalCells(nextCells);
      // Optimistically update the hand.
      setHand((prev) => [...prev, coin]);
      // Commit: send all positions except the picked-up coin.
      reorderCoinsMutation.mutate({
        notebook_id: notebook.id,
        coins: buildPositions(nextCells).filter((p) => p.coin_id !== coin.id),
      });
    },
    [localCells, buildPositions, notebook, reorderCoinsMutation]
  );

  const place = useCallback(
    ({ coordinates, coin: slotCoin }: SlotClickPayload) => {
      if (!notebook) return;
      if (hand.length === 0) return;

      const topCoin = hand[hand.length - 1];
      const newHand = hand.slice(0, -1);

      if (slotCoin !== null) {
        newHand.push(slotCoin);
      }

      // Build updated cells: put topCoin into the target slot, clear slotCoin.
      const { pageIndex, rowIdx, colIdx } = coordinates;
      const nextCells = localCells.map((page, pi) =>
        page.map((row, ri) =>
          row.map((c, ci) => {
            if (pi === pageIndex && ri === rowIdx && ci === colIdx)
              return topCoin;
            // If slotCoin moved into the hand, clear it from wherever it was.
            if (slotCoin && c?.id === slotCoin.id) return null;
            return c;
          })
        )
      );

      setLocalCells(nextCells);
      setHand(newHand);

      const targetPos = toFlat(pageIndex, rowIdx, colIdx);

      const excludeIds = new Set<number>([topCoin.id]);
      if (slotCoin) excludeIds.add(slotCoin.id);

      const positions = buildPositions(nextCells).filter(
        (p) => !excludeIds.has(p.coin_id)
      );
      positions.push({ coin_id: topCoin.id, position: targetPos });

      reorderCoinsMutation.mutate({
        notebook_id: notebook.id,
        coins: positions,
      });
    },
    [hand, localCells, toFlat, buildPositions, notebook, reorderCoinsMutation]
  );

  const discard = useCallback(() => {
    if (!notebook) return;
    setHand([]);
    // Clearing the hand will trigger the useEffect above to re-sync
    // localCells from notebook.cells (the last server state).
    reorderCoinsMutation.mutate({
      notebook_id: notebook.id,
      coins: buildPositions(notebook.cells),
    });
  }, [buildPositions, notebook, reorderCoinsMutation]);

  return {
    hand,
    isActive,
    topCoin: hand.length > 0 ? hand[hand.length - 1] : null,
    localCells,
    pickUp,
    place,
    discard,
    isPending: reorderCoinsMutation.isPending,
  };
}
