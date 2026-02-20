import { useState } from "react";

import { RowSelectionState } from "@tanstack/react-table";

import { CoinInfo } from "@/pages/coins/views/coin-info.tsx";
import { CoinPreview } from "@/pages/coins/views/coin-preview.tsx";
import { CoinsTable } from "@/pages/coins/views/coins-table.tsx";
import { IssuersList } from "@/pages/coins/views/issuers-list.tsx";
import { SimilarCoins } from "@/pages/coins/views/similar-coins.tsx";

export function CoinsView() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const coinSelectionIds = Object.keys(rowSelection).map((k) => Number(k));

  return (
    <div className="h-full w-full flex flex-col border-collapse">
      <div className="flex flex-1 max-h-1/2">
        <div className="w-1/6 border-r border-b">
          <div className="flex h-full items-center justify-center p-6">
            {coinSelectionIds.length ? (
              <CoinPreview coinId={coinSelectionIds[0]} />
            ) : null}
          </div>
        </div>
        <div className="w-7/12 border-r border-b">
          <div className="flex h-full items-center justify-center">
            {coinSelectionIds.length ? (
              <CoinInfo coinId={coinSelectionIds[0]} />
            ) : null}
          </div>
        </div>
        <div className="w-1/4 border-b">
          <div className="flex h-full items-center justify-center">
            {coinSelectionIds.length ? (
              <SimilarCoins
                coinId={coinSelectionIds[0]}
                selection={{
                  rowSelection,
                  onRowSelectionChange: setRowSelection,
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-1 max-h-1/2">
        <div className="w-3/4 border-r">
          <CoinsTable
            selection={{
              rowSelection,
              onRowSelectionChange: setRowSelection,
            }}
          />
        </div>
        <div className="w-1/4">
          <IssuersList />
        </div>
      </div>
    </div>
  );
}
