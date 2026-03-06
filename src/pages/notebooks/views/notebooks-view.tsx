import { useNotebookSelection } from "@/context/notebook-selection-context.tsx";
import { EmptyNotebooks } from "@/pages/notebooks/components/misc/empty-notebooks.tsx";
import { NotebookContents } from "@/pages/notebooks/components/sections/notebook-contents.tsx";
import { NotebooksList } from "@/pages/notebooks/components/sections/notebook-list.tsx";

export function NotebooksView() {
  const { rowSelection, setRowSelection, selectedNotebookId } =
    useNotebookSelection();

  return (
    <div className="h-full w-full flex border-collapse">
      {selectedNotebookId !== null ? (
        <>
          <NotebooksList
            notebookId={selectedNotebookId}
            selection={{ rowSelection, onRowSelectionChange: setRowSelection }}
          />
          <NotebookContents notebookId={selectedNotebookId} />
          <div className="flex flex-col w-1/4">
            <div>All coins</div>
            <div>Coin tray</div>
          </div>
        </>
      ) : (
        <EmptyNotebooks type="no data" />
      )}
    </div>
  );
}
