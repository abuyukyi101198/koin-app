export interface Issuer {
  id: number;
  name: string;
  continent: string;
  start_year: number;
  end_year: number | null;
  flag: string;
  predecessors?: Issuer[];
  created_at: string;
}

export interface IssuerDisplay {
  id: number;
  name: string;
  flag: string;
}

export interface PaginatedIssuers {
  items: Issuer[];
  total: number;
}

export interface ListIssuersRequest {
  search?: string | null;
}
