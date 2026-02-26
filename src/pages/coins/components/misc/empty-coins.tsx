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
import { useListCoins } from "@/query/commands";

interface EmptyCoinsProps {
  type: "no data" | "no match";
}

export function EmptyCoins({ type }: EmptyCoinsProps) {
  const { refetch } = useListCoins();

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
        <Button
          className="cursor-pointer"
          onClick={async () => {
            await refetch();
          }}
          variant="ghost"
        >
          <RefreshCcw />
          Refresh
        </Button>
        <CreateCoinDialog />
      </EmptyContent>
    </Empty>
  );
}
