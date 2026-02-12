import "@/styles/index.css";
import { useState } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";

import { Toaster } from "@/components/ui/sonner.tsx";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { CoinInfo } from "@/pages/coins/views/coin-info.tsx";
import { CoinsList } from "@/pages/coins/views/coins-list.tsx";
import { IssuersList } from "@/pages/coins/views/issuers-list.tsx";

const queryClient = new QueryClient();

function App() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const coinSelectionIds = Object.keys(rowSelection).map((k) => Number(k));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <main className="h-screen w-screen">
          <div className="h-full w-full flex flex-col border-collapse">
            <div className="flex flex-1 max-h-1/2">
              <div className="w-3/4 border-r border-b">
                <div className="flex h-full items-center justify-center">
                  {coinSelectionIds.length ? (
                    <CoinInfo coinId={coinSelectionIds[0]} />
                  ) : null}
                </div>
              </div>
              <div className="w-1/4 border-b">
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Details</span>
                </div>
              </div>
            </div>
            <div className="flex flex-1 max-h-1/2">
              <div className="w-3/4 border-r">
                <CoinsList
                  selection={{
                    rowSelection,
                    onRowSelectionChange: setRowSelection,
                  }}
                />
              </div>
              <div className="w-1/4">
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Issuers</span>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Toaster />
      </TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <main className="h-screen w-screen">
            <div className="h-full w-full flex flex-col border-collapse">
              <div className="flex flex-1 max-h-1/2">
                <div className="w-3/4 border-r border-b">
                  <div className="flex h-full items-center justify-center">
                    {coinSelectionIds.length ? (
                      <CoinInfo coinId={coinSelectionIds[0]} />
                    ) : null}
                  </div>
                </div>
                <div className="w-1/4 border-b">
                  <div className="flex h-full items-center justify-center p-6">
                    <span className="font-semibold">Details</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 max-h-1/2">
                <div className="w-3/4 border-r">
                  <CoinsList
                    selection={{
                      rowSelection,
                      onRowSelectionChange: setRowSelection,
                    }}
                  />
                </div>
                <div className="w-1/4">
                  <div className="flex h-full items-center justify-center">
                  </div>
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
