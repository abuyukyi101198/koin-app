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

import { useListCoins } from "@/query/commands";

interface CoinSelectionContextType {
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  selectedCoinId: number | null;
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
  const { data, isSuccess } = useListCoins();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedCoinId = useMemo(() => {
    const coinSelectionIds = Object.keys(rowSelection).map((k) => Number(k));
    return coinSelectionIds.length ? coinSelectionIds[0] : null;
  }, [rowSelection]);

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
    }),
    [rowSelection, selectedCoinId]
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
