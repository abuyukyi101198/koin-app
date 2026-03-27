import { useCallback, useEffect, useRef, useState } from "react";

import {
  HandEntry,
  HandOrigin,
  SlotClickPayload,
} from "@/pages/notebooks/types";
import { useReorderCoins } from "@/query/commands";
import { Coin, Notebook } from "@/query/types";

export type { HandEntry, HandOrigin, SlotClickPayload };

interface UseNotebookReorderProps {
  notebook: Notebook | undefined;
}

export function useNotebookReorder({ notebook }: UseNotebookReorderProps) {
  const reorderCoinsMutation = useReorderCoins();

  const [hand, setHand] = useState<HandEntry[]>([]);

  const [localCells, setLocalCells] = useState<(Coin | null)[][][]>(
    notebook?.cells ?? []
  );

  const pendingMutationRef = useRef(0);

  const mutate = useCallback(
    (args: Parameters<typeof reorderCoinsMutation.mutate>[0]) => {
      pendingMutationRef.current += 1;
      reorderCoinsMutation.mutate(args, {
        onSettled: () => {
          pendingMutationRef.current -= 1;
        },
      });
    },
    [reorderCoinsMutation]
  );

  useEffect(() => {
    if (!notebook) return;
    setHand([]);
    setLocalCells(notebook.cells);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebook?.id]);

  // Re-sync localCells from the server only when the hand is empty AND no
  // mutation is in flight (i.e. not an optimistic update we own).
  useEffect(() => {
    if (!notebook) return;
    if (hand.length === 0 && pendingMutationRef.current === 0) {
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
    (coin: Coin, origin: HandOrigin) => {
      if (!notebook) return;

      const nextCells = localCells.map((page) =>
        page.map((row) => row.map((c) => (c?.id === coin.id ? null : c)))
      );
      setLocalCells(nextCells);

      if (origin === "grid") {
        // Commit grid state without the picked coin
        mutate({
          notebook_id: notebook.id,
          coins: buildPositions(nextCells).filter((p) => p.coin_id !== coin.id),
        });
      }

      setHand((prev) => [...prev, { coin, origin }]);
    },
    [localCells, buildPositions, notebook, mutate]
  );

  const place = useCallback(
    (payload: SlotClickPayload | null) => {
      if (!notebook) return;
      if (hand.length === 0) return;

      const topEntry = hand[hand.length - 1];
      const topCoin = topEntry.coin;
      const newHand = hand.slice(0, -1);

      if (payload === null) {
        setHand(newHand);
        if (topEntry.origin === "grid") {
          // Unassign the coin from this notebook
          mutate({
            notebook_id: notebook.id,
            coins: buildPositions(localCells),
            unassign_coin_ids: [topCoin.id],
          });
        }
        return;
      }

      const { coordinates, coin: slotCoin } = payload;

      if (slotCoin !== null) {
        newHand.push({ coin: slotCoin, origin: "grid" });
      }

      const { pageIndex, rowIdx, colIdx } = coordinates;
      const nextCells = localCells.map((page, pi) =>
        page.map((row, ri) =>
          row.map((c, ci) => {
            if (pi === pageIndex && ri === rowIdx && ci === colIdx)
              return topCoin;
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

      mutate({
        notebook_id: notebook.id,
        coins: positions,
      });
    },
    [hand, localCells, toFlat, buildPositions, notebook, mutate]
  );

  return {
    hand,
    isActive,
    topCoin: hand.length > 0 ? hand[hand.length - 1].coin : null,
    topOrigin: hand.length > 0 ? hand[hand.length - 1].origin : null,
    localCells,
    pickUp,
    place,
    isPending: reorderCoinsMutation.isPending,
  };
}
