import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

export interface Coin {
  id: number;
  title: string;
  value: number;
  currency: string;
  year: number;
  issuer: string;
  obverse_image?: string;
  reverse_image?: string;
  quantity: number;
  sale_value?: number;
  notes?: string;
  created_at: string;
}

interface TauriHookResult<TData> {
  data: TData | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface PaginatedCoinsResponse {
  data: Coin[];
  total: number;
}

interface ListCoinsResponse extends TauriHookResult<Coin[]> {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCoins: number;
  setPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
}

interface GetCoinOptions {
  id: number;
}
interface GetCoinResponse extends TauriHookResult<Coin> {}

export interface CreateCoinOptions extends Omit<Coin, "id" | "created_at"> {}
interface CreateCoinResponse {
  loading: boolean;
  error: Error | null;
  mutate: (data: CreateCoinOptions) => Promise<void>;
}

interface UpdateCoinOptions extends Omit<Coin, "created_at"> {}
interface UpdateCoinResponse {
  loading: boolean;
  error: Error | null;
  mutate: (data: UpdateCoinOptions) => Promise<void>;
}

interface DeleteCoinOptions {
  id: number;
}
interface DeleteCoinResponse {
  loading: boolean;
  error: Error | null;
  mutate: (data: DeleteCoinOptions) => Promise<void>;
}

export function useListCoins(): ListCoinsResponse {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPageState] = useState(0);
  const [pageSize, setPageSizeState] = useState(10);
  const [totalCoins, setTotalCoins] = useState(0);

  const listCoins = async (
    offset: number = page * pageSize,
    limit: number = pageSize
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<PaginatedCoinsResponse>("list_coins", {
        offset,
        limit,
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
    await listCoins(newPage * pageSize, pageSize);
  };

  const setPageSize = async (newSize: number) => {
    setPageSizeState(newSize);
    setPageState(0);
    await listCoins(0, newSize);
  };

  useEffect(() => {
    void listCoins();
  }, []);

  const totalPages = Math.ceil(totalCoins / pageSize);

  return {
    data: coins,
    loading,
    error,
    refetch: () => listCoins(page * pageSize, pageSize),
    page,
    pageSize,
    totalPages,
    totalCoins,
    setPage,
    setPageSize,
  };
}

export function useGetCoin(options: GetCoinOptions): GetCoinResponse {
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

  const createCoin = async (data: CreateCoinOptions) => {
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

  const updateCoin = async (data: UpdateCoinOptions) => {
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

  const deleteCoin = async (data: DeleteCoinOptions) => {
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
