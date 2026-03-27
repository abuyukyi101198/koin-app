import { Coin } from "@/query/types/coins.ts";

export interface Notebook {
  id: number;
  title: string;
  description?: string;
  rows_per_page: number;
  columns_per_page: number;
  number_of_pages: number;
  created_at: string;
  coin_count: number;
  /** All pages: cells[page][row][col] */
  cells: (Coin | null)[][][];
}

export interface PaginatedNotebooks {
  items: Notebook[];
  total: number;
}

export interface ListNotebooksRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export interface GetNotebookRequest {
  id: number;
}

export interface CreateNotebookRequest {
  title: string;
  description?: string;
  rows_per_page: number;
  columns_per_page: number;
  number_of_pages: number;
}

export interface CoinPosition {
  coin_id: number;
  position: number;
}

export interface ReorderCoinsRequest {
  notebook_id: number;
  coins: CoinPosition[];
  unassign_coin_ids?: number[];
}
