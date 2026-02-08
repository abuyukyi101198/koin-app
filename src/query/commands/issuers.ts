import { ListIssuersRequest, PaginatedIssuers } from "@/query/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

const PAGE_SIZE = 20;
const ISSUERS_QUERY_KEY = "issuers";

export function useListIssuers({
  search: inputSearch = null,
}: ListIssuersRequest): UseQueryResult<PaginatedIssuers, Error> {
  return useQuery({
    queryKey: [ISSUERS_QUERY_KEY, "list", inputSearch],
    queryFn: async ({ pageParam = 0 }) => {
      return await invoke<PaginatedIssuers>("list_issuers", {
        offset: pageParam,
        limit: PAGE_SIZE,
        search: inputSearch || null,
      });
    },
  });
}
