import { TauriHookResult } from "@/query/types/index.ts";

export interface Issuer {
  id: number;
  name: string;
  flag: string;
  created_at: string;
}

export interface PaginatedIssuers {
  data: Issuer[];
  total: number;
}

export interface ListIssuersResponse extends Omit<
  TauriHookResult<Issuer[]>,
  "refetch"
> {}
