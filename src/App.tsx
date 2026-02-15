import "@/styles/index.css";
import { useState } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";

import { Toaster } from "@/components/ui/sonner.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { CoinInfo } from "@/pages/coins/views/coin-info.tsx";
import { CoinPreview } from "@/pages/coins/views/coin-preview.tsx";
import { CoinsTable } from "@/pages/coins/views/coins-table.tsx";
import { IssuersList } from "@/pages/coins/views/issuers-list.tsx";

const queryClient = new QueryClient();

function App() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const coinSelectionIds = Object.keys(rowSelection).map((k) => Number(k));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <main className="h-screen w-screen">
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
                  <div className="flex h-full items-center justify-center p-6">
                    <span className="font-semibold">Similar</span>
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
          </main>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
