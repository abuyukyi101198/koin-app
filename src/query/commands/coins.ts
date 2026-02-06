import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import {
  Coin,
  CreateCoinRequest,
  CreateCoinResponse,
  DeleteCoinRequest,
  DeleteCoinResponse,
  GetCoinRequest,
  GetCoinResponse,
  ListCoinsRequest,
  ListCoinsResponse,
  PaginatedCoins,
  UpdateCoinRequest,
  UpdateCoinResponse,
} from "@/query/types";

export function useListCoins(options?: ListCoinsRequest): ListCoinsResponse {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPageState] = useState(0);
  const [pageSize, setPageSizeState] = useState(10);
  const [totalCoins, setTotalCoins] = useState(0);

  const listCoins = async (
    offset: number = page * pageSize,
    limit: number = pageSize,
    listOptions?: ListCoinsRequest
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<PaginatedCoins>("list_coins", {
        offset,
        limit,
        search: listOptions?.search || options?.search,
        sortField: listOptions?.sortField || options?.sortField || "year",
        sortDirection:
          listOptions?.sortDirection || options?.sortDirection || "desc",
      });
      setCoins(result.data);
      setTotalCoins(result.total);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch coins:", error);
    } finally {
      setLoading(false);
    }
  };

  const setPage = async (newPage: number) => {
    setPageState(newPage);
    await listCoins(newPage * pageSize, pageSize, options);
  };

  const setPageSize = async (newSize: number) => {
    setPageSizeState(newSize);
    setPageState(0);
    await listCoins(0, newSize, options);
  };

  useEffect(() => {
    void listCoins(0, pageSize, options);
  }, [options?.search, options?.sortField, options?.sortDirection]);

  const totalPages = Math.ceil(totalCoins / pageSize);

  return {
    data: coins,
    loading,
    error,
    refetch: () => listCoins(page * pageSize, pageSize, options),
    page,
    pageSize,
    totalPages,
    totalCoins,
    setPage,
    setPageSize,
  };
}

export function useGetCoin(options: GetCoinRequest): GetCoinResponse {
  const [coin, setCoin] = useState<Coin>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCoin = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Coin>("get_coin", { id: options.id });
      setCoin(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch coin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getCoin();
  }, [options.id]);

  return {
    data: coin,
    loading,
    error,
    refetch: getCoin,
  };
}

export function useCreateCoin(): CreateCoinResponse {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCoin = async (data: CreateCoinRequest) => {
    try {
      setLoading(true);
      setError(null);
      await invoke<Coin>("create_coin", { coin: data });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to create coin:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    mutate: createCoin,
  };
}

export function useUpdateCoin(): UpdateCoinResponse {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateCoin = async (data: UpdateCoinRequest) => {
    try {
      setLoading(true);
      setError(null);
      await invoke<Coin>("update_coin", { request: data });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to update coin:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    mutate: updateCoin,
  };
}

export function useDeleteCoin(): DeleteCoinResponse {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteCoin = async (data: DeleteCoinRequest) => {
    try {
      setLoading(true);
      setError(null);
      await invoke<void>("delete_coin", { id: data.id });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to delete coin:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    mutate: deleteCoin,
  };
}
