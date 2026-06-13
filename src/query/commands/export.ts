import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

import { ExportCoinsRequest, ExportResponse } from "@/query/types";

export function useExportCoins() {
  return useMutation({
    mutationFn: async (data: ExportCoinsRequest) => {
      return await invoke<ExportResponse>("export_coins", {
        format: data.format,
      });
    },
  });
}
