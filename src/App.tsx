import "@/styles/index.css";
import { CoinsList } from "@/pages/coins/views/coins-list.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="h-screen w-screen">
        <CoinsList />
      </main>
    </QueryClientProvider>
  );
}

export default App;
