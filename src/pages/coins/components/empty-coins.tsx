import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Button } from "@/components/ui/button.tsx";
import { AddCoinDialog } from "@/pages/coins/components/add-coin-dialog.tsx";

interface EmptyCoinsProps {
  type: "no data" | "no match";
  refresh: () => Promise<void>;
}

export function EmptyCoins({ type, refresh }: EmptyCoinsProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>
          {type === "no data" ? "No Coins Yet" : "No Matching Coins"}
        </EmptyTitle>
        <EmptyDescription>
          {type === "no data"
            ? "You haven't added any coins to your catalogue yet. Get started by adding your first coin."
            : "Looks like you don't have such a coin. Add it to your catalogue."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button variant="ghost" onClick={refresh}>
          Refresh
        </Button>
        <AddCoinDialog onSuccess={refresh} />
      </EmptyContent>
    </Empty>
  );
}
