import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

export interface Currency {
  id: number;
  name: string;
  created_at: string;
}

export interface Issuer {
  id: number;
  name: string;
  created_at: string;
}

export interface Coin {
  id: number;
  title: string;
  value: number;
  currency: Currency;
  year: number;
  issuer: Issuer;
  obverse_image?: string;
  reverse_image?: string;
  quantity: number;
  sale_value?: number;
  notes?: string;
  created_at: string;
}

export type CurrencyInput = { id?: number; name?: string };
export type IssuerInput = { id?: number; name?: string };

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

export interface ListCoinsOptions {
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
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

export interface CreateCoinOptions {
  title: string;
  value: number;
  currency: CurrencyInput;
  year: number;
  issuer: IssuerInput;
  obverse_image?: string;
  reverse_image?: string;
  quantity?: number;
  sale_value?: number;
  notes?: string;
}
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

export function useListCoins(options?: ListCoinsOptions): ListCoinsResponse {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPageState] = useState(0);
  const [pageSize, setPageSizeState] = useState(10);
  const [totalCoins, setTotalCoins] = useState(0);

  const listCoins = async (
    offset: number = page * pageSize,
    limit: number = pageSize,
    listOptions?: ListCoinsOptions
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<PaginatedCoinsResponse>("list_coins", {
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

interface ListCurrenciesResponse extends TauriHookResult<Currency[]> {}

export function useListCurrencies(): ListCurrenciesResponse {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const listCurrencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Currency[]>("list_currencies");
      setCurrencies(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void listCurrencies();
  }, []);

  return {
    data: currencies,
    loading,
    error,
    refetch: listCurrencies,
  };
}

interface SearchCurrenciesResponse {
  items: Currency[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
}

export function useSearchCurrencies(
  query: string,
  page: number = 0,
  pageSize: number = 10
): SearchCurrenciesResponse {
  const [items, setItems] = useState<Currency[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const search = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await invoke<Currency[]>("list_currencies");

        // Client-side filtering
        const filtered = result.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase())
        );

        setTotal(filtered.length);
        setItems(filtered.slice(page * pageSize, (page + 1) * pageSize));
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    void search();
  }, [query, page, pageSize]);

  return {
    items,
    total,
    hasMore: (page + 1) * pageSize < total,
    loading,
    error,
  };
}

interface ListIssuersResponse extends TauriHookResult<Issuer[]> {}

export function useListIssuers(): ListIssuersResponse {
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const listIssuers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Issuer[]>("list_issuers");
      setIssuers(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch issuers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void listIssuers();
  }, []);

  return {
    data: issuers,
    loading,
    error,
    refetch: listIssuers,
  };
}

interface SearchIssuersResponse {
  items: Issuer[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
}

export function useSearchIssuers(
  query: string,
  page: number = 0,
  pageSize: number = 10
): SearchIssuersResponse {
  const [items, setItems] = useState<Issuer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const search = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await invoke<Issuer[]>("list_issuers");

        // Client-side filtering
        const filtered = result.filter((i) =>
          i.name.toLowerCase().includes(query.toLowerCase())
        );

        setTotal(filtered.length);
        setItems(filtered.slice(page * pageSize, (page + 1) * pageSize));
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    void search();
  }, [query, page, pageSize]);

  return {
    items,
    total,
    hasMore: (page + 1) * pageSize < total,
    loading,
    error,
  };
}

interface CreateCurrencyResponse {
  loading: boolean;
  error: Error | null;
  mutate: (name: string) => Promise<Currency>;
}

export function useCreateCurrency(): CreateCurrencyResponse {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCurrency = async (name: string): Promise<Currency> => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Currency>("create_currency", { name });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to create currency:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    mutate: createCurrency,
  };
}

interface CreateIssuerResponse {
  loading: boolean;
  error: Error | null;
  mutate: (name: string) => Promise<Issuer>;
}

export function useCreateIssuer(): CreateIssuerResponse {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createIssuer = async (name: string): Promise<Issuer> => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Issuer>("create_issuer", { name });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to create issuer:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    mutate: createIssuer,
  };
}
