import {
  Issuer,
  ListCoinsRequest,
  ListIssuersRequest,
  ListIssuersResponse,
  PaginatedIssuers,
} from "@/query/types";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useListIssuers(
  options?: ListIssuersRequest
): ListIssuersResponse {
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pageSize, setPageSizeState] = useState(10);
  const [totalIssuers, setTotalIssuers] = useState(0);

  const listCoins = async (
    limit: number = pageSize,
    listOptions?: ListCoinsRequest
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<PaginatedIssuers>("list_issuers", {
        limit,
        search: listOptions?.search || options?.search,
      });
      setIssuers(result.data);
      setTotalIssuers(result.total);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch issuers:", error);
    } finally {
      setLoading(false);
    }
  };

  const setPageSize = async (newSize: number) => {
    setPageSizeState(newSize);
    await listCoins(newSize, options);
  };

  useEffect(() => {
    void listCoins(pageSize, options);
  }, [options?.search]);

  return {
    data: issuers,
    loading,
    error,
    refetch: () => listCoins(pageSize, options),
    pageSize,
    totalIssuers,
    setPageSize,
  };
}
