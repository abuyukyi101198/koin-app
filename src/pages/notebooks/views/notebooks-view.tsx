import { useCallback, useRef, useState } from "react";

import { useDefaultLayout } from "react-resizable-panels";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { useNotebookSelection } from "@/context/notebook-selection-context.tsx";
import { NotebookAllCoins } from "@/pages/notebooks/components/sections/notebook-all-coins.tsx";
import { NotebookContents } from "@/pages/notebooks/components/sections/notebook-contents.tsx";
import { NotebookReorderContext } from "@/pages/notebooks/context/notebook-reorder-context.tsx";
import { useNotebookReorder } from "@/pages/notebooks/hooks/use-notebook-reorder.tsx";
import {
  useGetNotebook,
  useListNotebooks,
} from "@/query/commands/notebooks.ts";

export function NotebooksView() {
  const { selectedNotebookId } = useNotebookSelection();

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "resizable-panels",
    storage: localStorage,
  });

  const { data: notebook } = useGetNotebook({ id: selectedNotebookId ?? -1 });
  const { refetch } = useListNotebooks();
  const reorder = useNotebookReorder({ notebook });
  const placingRef = useRef(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const seedCursor = useCallback((pos: { x: number; y: number }) => {
    setCursor(pos);
  }, []);

  return (
    <NotebookReorderContext.Provider
      value={{ ...reorder, placingRef, seedCursor, cursor, setCursor }}
    >
      <div className="pt-11 h-full w-full flex flex-col gap-0 bg-accent/50">
        <Separator className="shrink-0 bg-primary" />
        <ResizablePanelGroup
          className="flex-1 min-h-0 flex flex-col pl-6 bg-background"
          defaultLayout={defaultLayout}
          id="resizable-panels"
          onLayoutChanged={onLayoutChanged}
          orientation="horizontal"
        >
          <ResizablePanel
            className="h-full pt-4 pr-4 flex flex-col"
            defaultSize="75%"
            id="main"
          >
            <NotebookContents
              notebookId={selectedNotebookId}
              onRefresh={refetch}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="h-full flex flex-col"
            defaultSize="25%"
            id="side"
            maxSize="50%"
            minSize="25%"
          >
            <NotebookAllCoins />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </NotebookReorderContext.Provider>
  );
}
