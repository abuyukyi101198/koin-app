import { createContext, useContext } from "react";

import { SlotClickPayload } from "@/pages/notebooks/hooks/use-notebook-reorder.tsx";
import { Coin } from "@/query/types";

export interface NotebookReorderContextType {
  hand: Coin[];
  isActive: boolean;
  topCoin: Coin | null;
  localCells: (Coin | null)[][][];
  pickUp: (coin: Coin) => void;
  place: (payload: SlotClickPayload) => void;
  discard: () => void;
  isPending: boolean;
}

export const NotebookReorderContext = createContext<
  NotebookReorderContextType | undefined
>(undefined);

export function useNotebookReorderContext(): NotebookReorderContextType {
  const ctx = useContext(NotebookReorderContext);
  if (!ctx) {
    throw new Error(
      "useNotebookReorderContext must be used within a NotebookReorderContext.Provider"
    );
  }
  return ctx;
}
