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
import { useListCoins } from "@/query/commands";

interface CoinSelectionContextType {
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  selectedCoinId: number | null;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  debouncedSearchQuery: string;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  size: number;
  handlePageSizeChange: (newSize: number) => void;
}

export const CoinSelectionContext = createContext<
  CoinSelectionContextType | undefined
>(undefined);

interface CoinSelectionProviderProps {
  children: ReactNode;
}

export function CoinSelectionProvider({
  children,
}: CoinSelectionProviderProps) {
  const { data, isSuccess } = useListCoins({
    sortField: "issuer",
    sortDirection: "asc",
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(1);
  };

  const selectedCoinId = useMemo(() => {
    const coinSelectionIds = Object.keys(rowSelection).map((k) => Number(k));
    return coinSelectionIds.length ? coinSelectionIds[0] : null;
  }, [rowSelection]);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  // Auto-select first coin when data loads
  useEffect(() => {
    if (isSuccess && data?.items && data.total && selectedCoinId === null) {
      setRowSelection({ [data.items[0].id]: true });
    } else if (isSuccess && !data?.total) {
      setRowSelection({});
    }
  }, [data?.items, data?.total, isSuccess, selectedCoinId]);

  const value: CoinSelectionContextType = useMemo(
    () => ({
      rowSelection,
      setRowSelection,
      selectedCoinId,
      searchQuery,
      setSearchQuery,
      debouncedSearchQuery,
      page,
      setPage,
      size,
      handlePageSizeChange,
    }),
    [
      rowSelection,
      searchQuery,
      debouncedSearchQuery,
      selectedCoinId,
      page,
      size,
    ]
  );

  return (
    <CoinSelectionContext.Provider value={value}>
      {children}
    </CoinSelectionContext.Provider>
  );
}

export function useCoinSelection() {
  const context = useContext(CoinSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useCoinSelection must be used within a CoinSelectionProvider"
    );
  }
  return context;
}
