import { Coin } from "@/query/types/coins.ts";

export interface Issuer {
  id: number;
  name: string;
  continent: string;
  start_year: number;
  end_year: number | null;
  flag: string;
  predecessors?: Issuer[];
  descendants?: Issuer[];
  issued_coins?: Coin[];
  created_at: string;
}

export interface IssuerDisplay {
  id: number;
  name: string;
  start_year: number;
  end_year: number | null;
  flag: string;
}

export interface PaginatedIssuers {
  items: Issuer[];
  total: number;
}

export interface ListIssuersRequest {
  page?: number;
  pageSize?: number;
  search?: string | null;
}

export interface GetIssuerRequest {
  id: number;
  limit?: number;
}
