import {
  Issuer,
  TauriHookResult,
  TauriMutationResult,
} from "@/query/types/index.ts";

export interface Coin {
  id: number;
  title: string;
  value: number;
  currency: string;
  year: number;
  issuer: Issuer;
  obverse_image?: string;
  reverse_image?: string;
  quantity: number;
  sale_value?: number;
  notes?: string;
  created_at: string;
}

export interface PaginatedCoins {
  data: Coin[];
  total: number;
}

export interface ListCoinsRequest {
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}
export interface ListCoinsResponse extends TauriHookResult<Coin[]> {
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
}

export interface GetCoinRequest {
  id: number;
}
export interface GetCoinResponse extends Omit<TauriHookResult<Coin>, "total"> {}

export interface CreateCoinRequest {
  title: string;
  value: number;
  currency: string;
  year: number;
  issuer_id: number;
  obverse_image?: string;
  reverse_image?: string;
  quantity?: number;
  sale_value?: number;
  notes?: string;
}
export interface CreateCoinResponse extends TauriMutationResult<CreateCoinRequest> {}

export interface UpdateCoinRequest {
  id: number;
  title?: string;
  value?: number;
  currency?: string;
  year?: number;
  issuer_id?: number;
  obverse_image?: string;
  reverse_image?: string;
  quantity?: number;
  sale_value?: number;
  notes?: string;
}
export interface UpdateCoinResponse extends TauriMutationResult<UpdateCoinRequest> {}

export interface DeleteCoinRequest {
  id: number;
}
export interface DeleteCoinResponse extends TauriMutationResult<DeleteCoinRequest> {}
