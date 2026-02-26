import { useCoinSelection } from "@/context/coin-selection-context.tsx";
import { EmptyCoins } from "@/pages/coins/components/misc/empty-coins.tsx";
import { CoinDetails } from "@/pages/coins/components/sections/coin-details.tsx";
import { CoinPreview } from "@/pages/coins/components/sections/coin-preview.tsx";
import { CoinsTable } from "@/pages/coins/components/sections/coins-table.tsx";
import { IssuersList } from "@/pages/coins/components/sections/issuers-list.tsx";
import { SimilarCoins } from "@/pages/coins/components/sections/similar-coins.tsx";

export function CoinsView() {
  const { rowSelection, setRowSelection, selectedCoinId } = useCoinSelection();

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
        <EmptyCoins type="no data" />
      )}
    </div>
  );
}
