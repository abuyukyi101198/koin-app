import { Issuer, ListIssuersResponse, PaginatedIssuers } from "@/query/types";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

let cachedResult: ListIssuersResponse | null = null;

export function useListIssuers(): ListIssuersResponse {
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadIssuers = async () => {
      if (cachedResult && cachedResult.data) {
        setIssuers(cachedResult.data);
        setTotal(cachedResult.total);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await invoke<PaginatedIssuers>("list_issuers");

        cachedResult = {
          data: result.data,
          total: result.total,
          loading: false,
          error: null,
        };

        setIssuers(result.data);
        setTotal(result.total);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("Failed to fetch issuers:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadIssuers();
  }, []);

  return {
    data: issuers,
    total,
    loading,
    error,
  };
}
