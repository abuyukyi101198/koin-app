import { useState } from "react";

import { RowSelectionState } from "@tanstack/react-table";

import { CoinDetails } from "@/pages/coins/components/sections/coin-details.tsx";
import { CoinPreview } from "@/pages/coins/components/sections/coin-preview.tsx";
import { CoinsTable } from "@/pages/coins/components/sections/coins-table.tsx";
import { IssuersList } from "@/pages/coins/components/sections/issuers-list.tsx";
import { SimilarCoins } from "@/pages/coins/components/sections/similar-coins.tsx";

export function CoinsView() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const coinSelectionIds = Object.keys(rowSelection).map((k) => Number(k));

  return (
    <div className="h-full w-full flex flex-col border-collapse">
      <div className="flex flex-1 max-h-1/2">
        {coinSelectionIds.length ? (
          <>
            <CoinPreview coinId={coinSelectionIds[0]} />
            <CoinDetails coinId={coinSelectionIds[0]} />
            <SimilarCoins
              coinId={coinSelectionIds[0]}
              selection={{
                rowSelection,
                onRowSelectionChange: setRowSelection,
              }}
            />
          </>
        ) : null}
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
    </div>
  );
}
