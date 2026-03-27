import {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
} from "react";

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
  isPending: boolean;
  placingRef: RefObject<boolean>;
  cursor: { x: number; y: number } | null;
  setCursor: Dispatch<SetStateAction<{ x: number; y: number } | null>>;
  seedCursor: (pos: { x: number; y: number }) => void;
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
