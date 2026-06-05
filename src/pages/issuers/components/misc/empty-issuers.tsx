import { openUrl } from "@tauri-apps/plugin-opener";
import { Flag, Github, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";

interface EmptyIssuersProps {
  type: "no data" | "no match";
  onRefresh?: () => void;
}

export function EmptyIssuers({ type, onRefresh }: EmptyIssuersProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Flag className="text-primary" />
        </EmptyMedia>
        <EmptyTitle className="font-serif text-2xl">
          {type === "no data"
            ? "Could not fetch issuers"
            : "No matching issuer"}
        </EmptyTitle>
        <EmptyDescription>
          {type === "no data"
            ? "Something went wrong with fetching the issuers. Give it a refresh."
            : "Looks like there is no such issuer registered. Recommend its addition to Koin's issuers list."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        {onRefresh && (
          <Button
            className="cursor-pointer"
            onClick={onRefresh}
            variant="ghost"
          >
            <RefreshCcw />
            Refresh
          </Button>
        )}
        <Button
          className="cursor-pointer"
          onClick={async () => {
            await openUrl("https://github.com/abuyukyi101198/koin-app");
          }}
          variant="outline"
        >
          <span className="flex items-center p-0 gap-0">
            <Flag className="size-3" />
            <Github />
          </span>
          Propose an issuer
        </Button>
      </EmptyContent>
    </Empty>
  );
}
