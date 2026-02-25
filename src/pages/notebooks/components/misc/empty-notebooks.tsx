import { BookCopy, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { CreateNotebookDialog } from "@/pages/notebooks/components/forms/create-notebook-dialog.tsx";

interface EmptyNotebooksProps {
  type: "no data" | "no match";
  refresh: () => Promise<void>;
}

export function EmptyNotebooks({ type, refresh }: EmptyNotebooksProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookCopy />
        </EmptyMedia>
        <EmptyTitle>
          {type === "no data" ? "No notebooks yet" : "No matching notebooks"}
        </EmptyTitle>
        <EmptyDescription>
          {type === "no data"
            ? "You haven't added any notebooks to organize your collection yet. Get started by creating your first notebook."
            : "Looks like you don't have a notebook with that name. Add another notebook to organize your collection."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button className="cursor-pointer" onClick={refresh} variant="ghost">
          <RefreshCcw />
          Refresh
        </Button>
        <CreateNotebookDialog />
      </EmptyContent>
    </Empty>
  );
}
