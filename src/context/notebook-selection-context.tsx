import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { RowSelectionState } from "@tanstack/react-table";

import { useListNotebooks } from "@/query/commands";

interface NotebookSelectionContextType {
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  selectedNotebookId: number | null;
}

export const NotebookSelectionContext = createContext<
  NotebookSelectionContextType | undefined
>(undefined);

interface NotebookSelectionProviderProps {
  children: ReactNode;
}

export function NotebookSelectionProvider({
  children,
}: NotebookSelectionProviderProps) {
  const { data, isSuccess } = useListNotebooks({
    sortField: "issuer",
    sortDirection: "asc",
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedNotebookId = useMemo(() => {
    const coinSelectionIds = Object.keys(rowSelection).map((k) => Number(k));
    return coinSelectionIds.length ? coinSelectionIds[0] : null;
  }, [rowSelection]);

  // Auto-select first coin when data loads
  useEffect(() => {
    if (isSuccess && data?.items && data.total && selectedNotebookId === null) {
      setRowSelection({ [data.items[0].id]: true });
    } else if (isSuccess && !data?.total) {
      setRowSelection({});
    }
  }, [data?.items, data?.total, isSuccess, selectedNotebookId]);

  const value: NotebookSelectionContextType = useMemo(
    () => ({
      rowSelection,
      setRowSelection,
      selectedNotebookId,
    }),
    [rowSelection, selectedNotebookId]
  );

  return (
    <NotebookSelectionContext.Provider value={value}>
      {children}
    </NotebookSelectionContext.Provider>
  );
}

export function useNotebookSelection() {
  const context = useContext(NotebookSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useNotebookSelection must be used within a NotebookSelectionProvider"
    );
  }
  return context;
}
