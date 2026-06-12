import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

import { Settings, UpdateSettingsRequest } from "@/query/types";

export const SETTINGS_QUERY_KEY = "settings";

export function useGetSettings(): UseQueryResult<Settings> {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: async () => {
      return await invoke<Settings>("get_settings");
    },
    staleTime: Infinity,
  });
}

export function useUpdateSettings(): UseMutationResult<
  Settings,
  Error,
  UpdateSettingsRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      return await invoke<Settings>("update_settings", { settings: data });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData([SETTINGS_QUERY_KEY], updated);
    },
  });
}
