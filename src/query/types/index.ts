export interface TauriHookResult<TData> {
  data: TData | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface TauriMutationResult<TRequest> {
  loading: boolean;
  error: Error | null;
  mutate: (data: TRequest) => Promise<void>;
}

export * from "./coins";
export * from "./issuers";
