import { Coin } from "@/query/types";

export interface SlotCoordinates {
  pageIndex: number;
  rowIdx: number;
  colIdx: number;
}

export interface SlotClickPayload {
  coordinates: SlotCoordinates;
  coin: Coin | null;
}

export type HandOrigin = "grid" | "list";

export interface HandEntry {
  coin: Coin;
  origin: HandOrigin;
}

export interface GridMetrics {
  isLandscape: boolean;
  slotWidth: number;
  slotHeight: number;
}
