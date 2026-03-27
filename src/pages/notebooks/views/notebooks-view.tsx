import { useCallback, useRef, useState } from "react";

import { useNotebookSelection } from "@/context/notebook-selection-context.tsx";
import { EmptyNotebooks } from "@/pages/notebooks/components/misc/empty-notebooks.tsx";
import { NotebookAllCoins } from "@/pages/notebooks/components/sections/notebook-all-coins.tsx";
import { NotebookContents } from "@/pages/notebooks/components/sections/notebook-contents.tsx";
import { NotebooksList } from "@/pages/notebooks/components/sections/notebook-list.tsx";
import { NotebookReorderContext } from "@/pages/notebooks/context/notebook-reorder-context.tsx";
import { useNotebookReorder } from "@/pages/notebooks/hooks/use-notebook-reorder.tsx";
import { useGetNotebook } from "@/query/commands/notebooks.ts";

export function NotebooksView() {
  const { rowSelection, setRowSelection, selectedNotebookId } =
    useNotebookSelection();

  const { data: notebook } = useGetNotebook({ id: selectedNotebookId ?? -1 });
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
      <div className="h-full w-full flex border-collapse">
        {selectedNotebookId !== null ? (
          <>
            <div className="w-1/6 flex flex-col">
              <NotebooksList
                notebookId={selectedNotebookId}
                selection={{
                  rowSelection,
                  onRowSelectionChange: setRowSelection,
                }}
              />
            </div>
            <NotebookContents notebookId={selectedNotebookId} />
            <NotebookAllCoins />
          </>
        ) : (
          <EmptyNotebooks type="no data" />
        )}
      </div>
    </NotebookReorderContext.Provider>
  );
}
