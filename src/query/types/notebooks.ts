import { Coin } from "@/query/types/coins.ts";

export interface Notebook {
  id: number;
  title: string;
  description?: string;
  rows_per_page: number;
  columns_per_page: number;
  number_of_pages: number;
  created_at: string;
}

export interface NotebookPage {
  index: number;
  cells: (Coin | null)[][];
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

export interface GetNotebookPageRequest {
  id: number;
  page: number;
}

export interface CreateNotebookRequest {
  title: string;
  description?: string;
  rows_per_page: number;
  columns_per_page: number;
  number_of_pages: number;
}
