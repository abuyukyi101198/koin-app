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

interface UseCoinsResult {
  coins: Coin[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCoins(): UseCoinsResult {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Coin[]>("get_coins");
      setCoins(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch coins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCoins();
  }, []);

  return {
    coins,
    loading,
    error,
    refetch: fetchCoins,
  };
}
