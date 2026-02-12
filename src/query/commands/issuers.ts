import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

import { ListIssuersRequest, PaginatedIssuers } from "@/query/types";

const ISSUERS_QUERY_KEY = "issuers";

export function useListIssuers(
  options?: ListIssuersRequest
): UseQueryResult<PaginatedIssuers> {
  return useQuery({
    queryKey: [ISSUERS_QUERY_KEY, "list", options?.search],
    queryFn: async () => {
      return await invoke<PaginatedIssuers>("list_issuers", {
        offset: options?.page,
        limit: options?.pageSize,
        search: options?.search || null,
      });
    },
  });
}
