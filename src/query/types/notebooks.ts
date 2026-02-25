import { Coin } from "@/query/types/coins.ts";

export interface Notebook {
  id: number;
  title: string;
  description?: string;
  rows_per_page: number;
  columns_per_page: number;
  number_of_pages: number;
  coins: Coin[];
  created_at: string;
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
