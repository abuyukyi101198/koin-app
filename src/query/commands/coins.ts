import { invoke } from "@tauri-apps/api/core";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  Coin,
  CreateCoinRequest,
  DeleteCoinRequest,
  GetCoinRequest,
  ListCoinsRequest,
  PaginatedCoins,
  UpdateCoinRequest,
} from "@/query/types";

const COINS_QUERY_KEY = "coins";

export function useListCoins(
  options?: ListCoinsRequest
): UseQueryResult<PaginatedCoins, Error> {
  const offset =
    options && options.page && options.pageSize
      ? options.page * options.pageSize
      : undefined;
  return useQuery({
    queryKey: [
      COINS_QUERY_KEY,
      "list",
      options?.page,
      options?.pageSize,
      options?.search,
      options?.sortField,
      options?.sortDirection,
    ],
    queryFn: async () => {
      return await invoke<PaginatedCoins>("list_coins", {
        offset: offset,
        limit: options?.pageSize,
        search: options?.search || undefined,
        sortField: options?.sortField || "year",
        sortDirection: options?.sortDirection || "desc",
      });
    },
  });
}

export function useGetCoin(
  options: GetCoinRequest
): UseQueryResult<Coin, Error> {
  return useQuery({
    queryKey: [COINS_QUERY_KEY, "get", options.id],
    queryFn: async () => {
      return await invoke<Coin>("get_coin", { id: options.id });
    },
  });
}

export function useCreateCoin(): UseMutationResult<
  Coin,
  Error,
  CreateCoinRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCoinRequest) => {
      return await invoke<Coin>("create_coin", { coin: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COINS_QUERY_KEY] });
    },
  });
}

export function useUpdateCoin(): UseMutationResult<
  Coin,
  Error,
  UpdateCoinRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCoinRequest) => {
      return await invoke<Coin>("update_coin", { request: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COINS_QUERY_KEY] });
    },
  });
}

export function useDeleteCoin(): UseMutationResult<
  void,
  Error,
  DeleteCoinRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteCoinRequest) => {
      return await invoke<void>("delete_coin", { id: data.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COINS_QUERY_KEY] });
    },
  });
}
