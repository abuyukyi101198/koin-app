import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

import {
  Issuer,
  GetIssuerRequest,
  ListIssuersRequest,
  PaginatedIssuers,
} from "@/query/types";

const ISSUERS_QUERY_KEY = "issuers";

export function useListIssuers(
  options?: ListIssuersRequest
): UseQueryResult<PaginatedIssuers> {
  return useQuery({
    queryKey: [
      ISSUERS_QUERY_KEY,
      "list",
      options?.page,
      options?.pageSize,
      options?.search,
    ],
    queryFn: async () => {
      return await invoke<PaginatedIssuers>("list_issuers", {
        offset:
          options?.page != null && options?.pageSize != null
            ? options.page * options.pageSize
            : undefined,
        limit: options?.pageSize,
        search: options?.search || null,
      });
    },
    staleTime: () => (options?.search === null ? Infinity : 0),
    placeholderData: keepPreviousData,
  });
}

export function useGetIssuer(
  options: GetIssuerRequest
): UseQueryResult<Issuer> {
  return useQuery({
    queryKey: [ISSUERS_QUERY_KEY, "get", options.id],
    queryFn: async () => {
      return await invoke<Issuer>("get_issuer", { id: options.id });
    },
    placeholderData: keepPreviousData,
  });
}
