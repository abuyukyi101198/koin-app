import {
  keepPreviousData,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

import { COINS_QUERY_KEY } from "@/query/commands/coins.ts";
import {
  CreateNotebookRequest,
  GetNotebookRequest,
  ListNotebooksRequest,
  Notebook,
  PaginatedNotebooks,
  ReorderCoinsRequest,
} from "@/query/types/notebooks.ts";

const NOTEBOOKS_QUERY_KEY = "notebooks";

export function useListNotebooks(
  options?: ListNotebooksRequest
): UseQueryResult<PaginatedNotebooks> {
  const offset =
    options && options.page && options.pageSize
      ? options.page * options.pageSize
      : undefined;
  return useQuery({
    queryKey: [
      NOTEBOOKS_QUERY_KEY,
      "list",
      options?.page,
      options?.pageSize,
      options?.search,
      options?.sortField,
      options?.sortDirection,
    ],
    queryFn: async () => {
      return await invoke<PaginatedNotebooks>("list_notebooks", {
        offset: offset,
        limit: options?.pageSize,
        search: options?.search || undefined,
        sortField: options?.sortField || "year",
        sortDirection: options?.sortDirection || "desc",
      });
    },
    placeholderData: keepPreviousData,
  });
}

export function useGetNotebook(
  options: GetNotebookRequest
): UseQueryResult<Notebook> {
  return useQuery({
    queryKey: [NOTEBOOKS_QUERY_KEY, "get", options.id],
    queryFn: async () => {
      return await invoke<Notebook>("get_notebook", { id: options.id });
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateNotebook(): UseMutationResult<
  Notebook,
  Error,
  CreateNotebookRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNotebookRequest) => {
      return await invoke<Notebook>("create_notebook", { notebook: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTEBOOKS_QUERY_KEY] });
    },
  });
}

export function useReorderCoins(): UseMutationResult<
  Notebook,
  Error,
  ReorderCoinsRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderCoinsRequest) => {
      return await invoke<Notebook>("reorder_coins", {
        notebookId: data.notebook_id,
        coins: data.coins,
        unassignCoinIds: data.unassign_coin_ids ?? [],
      });
    },
    onSuccess: (notebook) => {
      queryClient.setQueryData(
        [NOTEBOOKS_QUERY_KEY, "get", notebook.id],
        notebook
      );
      queryClient.invalidateQueries({ queryKey: [COINS_QUERY_KEY] });
    },
  });
}
