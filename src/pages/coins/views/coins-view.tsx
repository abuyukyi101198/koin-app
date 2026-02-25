import { useEffect, useMemo, useState } from "react";

import { RowSelectionState } from "@tanstack/react-table";

import { EmptyCoins } from "@/pages/coins/components/misc/empty-coins.tsx";
import { CoinDetails } from "@/pages/coins/components/sections/coin-details.tsx";
import { CoinPreview } from "@/pages/coins/components/sections/coin-preview.tsx";
import { CoinsTable } from "@/pages/coins/components/sections/coins-table.tsx";
import { IssuersList } from "@/pages/coins/components/sections/issuers-list.tsx";
import { SimilarCoins } from "@/pages/coins/components/sections/similar-coins.tsx";
import { useListCoins } from "@/query/commands";

export function CoinsView() {
  const { data, isSuccess, refetch } = useListCoins();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedCoinId = useMemo(() => {
    const coinSelectionIds = Object.keys(rowSelection).map((k) => Number(k));
    return coinSelectionIds.length ? coinSelectionIds[0] : null;
  }, [rowSelection]);

  useEffect(() => {
    if (isSuccess && data.items && data.total && selectedCoinId === null) {
      setRowSelection({ [data.items[0].id]: true });
    } else if (isSuccess && !data.total) {
      setRowSelection({});
    }
  }, [data?.items, data?.total, isSuccess, selectedCoinId]);

  return (
    <div className="h-full w-full flex flex-col border-collapse">
      {selectedCoinId !== null ? (
        <>
          <div className="flex flex-1 max-h-1/2">
            <CoinPreview coinId={selectedCoinId} />
            <CoinDetails coinId={selectedCoinId} />
            <SimilarCoins
              coinId={selectedCoinId}
              selection={{
                rowSelection,
                onRowSelectionChange: setRowSelection,
              }}
            />
          </div>
          <div className="flex flex-1 max-h-1/2">
            <CoinsTable
              selection={{
                rowSelection,
                onRowSelectionChange: setRowSelection,
              }}
            />
            <IssuersList />
          </div>
        </>
      ) : (
        <EmptyCoins
          refresh={async () => {
            await refetch();
          }}
          type="no data"
        />
      )}
    </div>
  );
}
