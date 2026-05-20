import { IssuerDisplay } from "@/query/types/index.ts";

export type ImageProcessingMode =
  | "download_and_remove_bg"
  | "download"
  | "none";

export interface Coin {
  id: number;
  title: string;
  value: number;
  currency: string;
  year: number;
  issuer: IssuerDisplay;
  description?: string;
  obverse_image?: string;
  reverse_image?: string;
  quantity: number;
  sale_value?: number;
  notes?: string;
  created_at: string;
  notebook_id?: number;
  notebook_position?: number;
}

export interface PaginatedCoins {
  items: Coin[];
  total: number;
}

export interface ListCoinsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export interface GetCoinRequest {
  id: number;
}

export interface GetSimilarCoinsRequest {
  id: number;
  pageSize?: number;
}

export interface CreateCoinRequest {
  value: number;
  currency: string;
  year: number;
  issuer_id: number;
  description?: string;
  obverse_image?: string;
  reverse_image?: string;
  quantity?: number;
  sale_value?: number;
  notes?: string;
  image_processing?: ImageProcessingMode;
}

export interface UpdateCoinRequest {
  id: number;
  value?: number;
  currency?: string;
  year?: number;
  issuer_id?: number;
  description?: string;
  obverse_image?: string;
  reverse_image?: string;
  quantity?: number;
  sale_value?: number;
  notes?: string;
  image_processing?: ImageProcessingMode;
}

export interface DeleteCoinRequest {
  id: number;
}
