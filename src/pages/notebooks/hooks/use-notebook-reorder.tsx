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

  // True while a reorder mutation is in-flight. Prevents the hand-empty
  // sync effect from overwriting optimistic localCells with stale server
  // state before the mutation response arrives.
  const pendingMutationRef = useRef(false);

  const mutate = useCallback(
    (args: Parameters<typeof reorderCoinsMutation.mutate>[0]) => {
      pendingMutationRef.current = true;
      reorderCoinsMutation.mutate(args, {
        onSettled: () => {
          pendingMutationRef.current = false;
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
    if (hand.length === 0 && !pendingMutationRef.current) {
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

      let nextCells = localCells;
      if (origin === "grid") {
        // Remove from grid immediately
        nextCells = localCells.map((page) =>
          page.map((row) => row.map((c) => (c?.id === coin.id ? null : c)))
        );
        setLocalCells(nextCells);
        // Commit grid state without the picked coin
        mutate({
          notebook_id: notebook.id,
          coins: buildPositions(nextCells).filter((p) => p.coin_id !== coin.id),
        });
      }
      // "list" origin: coin isn't in the grid, nothing to remove

      setHand((prev) => [...prev, { coin, origin }]);
    },
    [localCells, buildPositions, notebook, mutate]
  );

  /**
   * Place the top coin into a slot, or discard it (origin-aware) when
   * payload is null (clicked outside any valid slot).
   */
  const place = useCallback(
    (payload: SlotClickPayload | null) => {
      if (!notebook) return;
      if (hand.length === 0) return;

      const topEntry = hand[hand.length - 1];
      const topCoin = topEntry.coin;
      const newHand = hand.slice(0, -1);

      // ── Discard path: null payload = clicked outside ──────────────────
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
        // "list" origin: coin was never in this notebook — no server call
        return;
      }

      // ── Place path: valid slot ─────────────────────────────────────────
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

  /** Discard the entire hand, unassigning all grid-origin coins. */
  const discard = useCallback(() => {
    if (!notebook) return;

    const unassignIds = hand
      .filter((e) => e.origin === "grid")
      .map((e) => e.coin.id);

    setHand([]);

    mutate({
      notebook_id: notebook.id,
      coins: buildPositions(notebook.cells),
      unassign_coin_ids: unassignIds.length ? unassignIds : undefined,
    });
  }, [hand, buildPositions, notebook, mutate]);

  return {
    hand,
    isActive,
    topCoin: hand.length > 0 ? hand[hand.length - 1].coin : null,
    topOrigin: hand.length > 0 ? hand[hand.length - 1].origin : null,
    localCells,
    pickUp,
    place,
    discard,
    isPending: reorderCoinsMutation.isPending,
  };
}
