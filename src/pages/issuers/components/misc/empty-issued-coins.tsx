import { Coins } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { CreateCoinDialog } from "@/pages/coins/components/forms/create-coin-dialog.tsx";

export function EmptyIssuedCoins() {
  return (
    <Empty className="px-6!">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Coins className="text-primary" />
        </EmptyMedia>
        <EmptyTitle className="font-serif text-xl">No issued coins</EmptyTitle>
        <EmptyDescription>
          There are no coins in your collection by this issuer. Add one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2 text-sm">
        <CreateCoinDialog />
      </EmptyContent>
    </Empty>
  );
}
