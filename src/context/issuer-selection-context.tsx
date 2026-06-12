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

import { useListIssuers } from "@/query/commands";

interface IssuerSelectionContextType {
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  selectedIssuerId: number | null;
  issuerSearchQuery: string;
  setIssuerSearchQuery: Dispatch<SetStateAction<string>>;
  activeLetter: string | null;
  setActiveLetter: Dispatch<SetStateAction<string | null>>;
}

export const IssuerSelectionContext = createContext<
  IssuerSelectionContextType | undefined
>(undefined);

interface IssuerSelectionProviderProps {
  children: ReactNode;
}

export function IssuerSelectionProvider({
  children,
}: IssuerSelectionProviderProps) {
  const { data, isSuccess } = useListIssuers();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [issuerSearchQuery, setIssuerSearchQuery] = useState<string>("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const selectedIssuerId = useMemo(() => {
    const issuerSelectionIds = Object.keys(rowSelection).map((k) => Number(k));
    return issuerSelectionIds.length ? issuerSelectionIds[0] : null;
  }, [rowSelection]);

  // Auto-select first issuer when data loads
  useEffect(() => {
    if (isSuccess && data?.items && data.total && selectedIssuerId === null) {
      setRowSelection({ [data.items[0].id]: true });
    } else if (isSuccess && !data?.total) {
      setRowSelection({});
    }
  }, [data?.items, data?.total, isSuccess, selectedIssuerId]);

  const value: IssuerSelectionContextType = useMemo(
    () => ({
      rowSelection,
      setRowSelection,
      selectedIssuerId,
      issuerSearchQuery,
      setIssuerSearchQuery,
      activeLetter,
      setActiveLetter,
    }),
    [rowSelection, selectedIssuerId, issuerSearchQuery, activeLetter]
  );

  return (
    <IssuerSelectionContext.Provider value={value}>
      {children}
    </IssuerSelectionContext.Provider>
  );
}

export function useIssuerSelection() {
  const context = useContext(IssuerSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useIssuerSelection must be used within a IssuerSelectionProvider"
    );
  }
  return context;
}
