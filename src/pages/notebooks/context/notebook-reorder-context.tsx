import { createContext, RefObject, useContext } from "react";

import {
  HandEntry,
  HandOrigin,
  SlotClickPayload,
} from "@/pages/notebooks/types.ts";
import { Coin } from "@/query/types";

export interface NotebookReorderContextType {
  hand: HandEntry[];
  isActive: boolean;
  topCoin: Coin | null;
  topOrigin: HandOrigin | null;
  localCells: (Coin | null)[][][];
  pickUp: (coin: Coin, origin: HandOrigin) => void;
  place: (payload: SlotClickPayload | null) => void;
  discard: () => void;
  isPending: boolean;
  /** Flip to true before calling place(payload) to tell the global window
   *  click listener that this click was a valid placement, not an outside click. */
  placingRef: RefObject<boolean>;
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
