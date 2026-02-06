import { TauriHookResult } from "@/query/types/index.ts";

export interface Issuer {
  id: number;
  name: string;
  created_at: string;
}

export interface PaginatedIssuers {
  data: Issuer[];
  total: number;
}

export interface ListIssuersRequest {
  search?: string;
}
export interface ListIssuersResponse extends TauriHookResult<Issuer[]> {
  pageSize: number;
  totalIssuers: number;
  setPageSize: (size: number) => Promise<void>;
}
