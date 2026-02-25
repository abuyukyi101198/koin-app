import { Coins, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { CreateCoinDialog } from "@/pages/coins/components/forms/create-coin-dialog.tsx";

interface EmptyCoinsProps {
  type: "no data" | "no match";
  refresh: () => Promise<void>;
}

export function EmptyCoins({ type, refresh }: EmptyCoinsProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Coins />
        </EmptyMedia>
        <EmptyTitle>
          {type === "no data" ? "No coins yet" : "No matching coins"}
        </EmptyTitle>
        <EmptyDescription>
          {type === "no data"
            ? "You haven't added any coins to your catalogue yet. Get started by adding your first coin."
            : "Looks like you don't have such a coin. Add it to your catalogue."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button className="cursor-pointer" onClick={refresh} variant="ghost">
          <RefreshCcw />
          Refresh
        </Button>
        <CreateCoinDialog />
      </EmptyContent>
    </Empty>
  );
}
