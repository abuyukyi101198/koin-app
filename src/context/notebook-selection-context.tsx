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

import { useDebounce } from "@/hooks/use-debounce.ts";
import { useListNotebooks } from "@/query/commands";

interface NotebookSelectionContextType {
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  selectedNotebookId: number | null;
  contentsPage: number;
  setContentsPage: Dispatch<SetStateAction<number>>;
  allCoinsPage: number;
  setAllCoinsPage: Dispatch<SetStateAction<number>>;
  allCoinsSearchQuery: string;
  setAllCoinsSearchQuery: Dispatch<SetStateAction<string>>;
  debouncedAllCoinsSearchQuery: string;
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
    sortField: "id",
    sortDirection: "asc",
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [contentsPage, setContentsPage] = useState(1);
  const [allCoinsPage, setAllCoinsPage] = useState(1);
  const [allCoinsSearchQuery, setAllCoinsSearchQuery] = useState<string>("");
  const debouncedAllCoinsSearchQuery = useDebounce(allCoinsSearchQuery, 300);

  const selectedNotebookId = useMemo(() => {
    const notebookSelectionIds = Object.keys(rowSelection).map((k) =>
      Number(k)
    );
    return notebookSelectionIds.length ? notebookSelectionIds[0] : null;
  }, [rowSelection]);

  // Reset contents page when selected notebook changes
  useEffect(() => {
    setContentsPage(1);
  }, [selectedNotebookId]);

  // Reset all-coins page when its search query changes
  useEffect(() => {
    setAllCoinsPage(1);
  }, [debouncedAllCoinsSearchQuery]);

  // Auto-select first notebook when data loads
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
      contentsPage,
      setContentsPage,
      allCoinsPage,
      setAllCoinsPage,
      allCoinsSearchQuery,
      setAllCoinsSearchQuery,
      debouncedAllCoinsSearchQuery,
    }),
    [
      rowSelection,
      selectedNotebookId,
      contentsPage,
      allCoinsPage,
      allCoinsSearchQuery,
      debouncedAllCoinsSearchQuery,
    ]
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
