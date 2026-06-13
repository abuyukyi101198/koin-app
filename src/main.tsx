import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import { ThemeProvider } from "./components/ui/theme-provider";
import { CoinSelectionProvider } from "./context/coin-selection-context";
import { NotebookSelectionProvider } from "./context/notebook-selection-context";
import { router } from "./router";

import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { IssuerSelectionProvider } from "@/context/issuer-selection-context.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CoinSelectionProvider>
          <NotebookSelectionProvider>
            <IssuerSelectionProvider>
              <TooltipProvider>
                <RouterProvider router={router} />
              </TooltipProvider>
            </IssuerSelectionProvider>
          </NotebookSelectionProvider>
        </CoinSelectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
