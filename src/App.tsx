import "@/styles/index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { CoinsList } from "@/pages/coins/views/coins-list.tsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <main className="h-screen w-screen">
          <CoinsList />
        </main>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
