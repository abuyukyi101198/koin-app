import { useEffect, useMemo, useState } from "react";

import { RowSelectionState } from "@tanstack/react-table";

import { EmptyNotebooks } from "@/pages/notebooks/components/misc/empty-notebooks.tsx";
import { NotebookContents } from "@/pages/notebooks/components/sections/notebook-contents.tsx";
import { NotebooksList } from "@/pages/notebooks/components/sections/notebook-list.tsx";
import { useListNotebooks } from "@/query/commands/notebooks.ts";

export function NotebooksView() {
  const { data, isSuccess, refetch } = useListNotebooks();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedNotebookId = useMemo(() => {
    const notebookSelectionIds = Object.keys(rowSelection).map((k) =>
      Number(k)
    );
    return notebookSelectionIds.length ? notebookSelectionIds[0] : null;
  }, [rowSelection]);

  useEffect(() => {
    if (isSuccess && data.items && data.total && selectedNotebookId === null) {
      setRowSelection({ [data.items[0].id]: true });
    } else if (isSuccess && !data.total) {
      setRowSelection({});
    }
  }, [data?.items, data?.total, isSuccess, selectedNotebookId]);

  return (
    <div className="h-full w-full flex border-collapse">
      {selectedNotebookId !== null ? (
        <>
          <NotebooksList
            selection={{ rowSelection, onRowSelectionChange: setRowSelection }}
          />
          <NotebookContents notebookId={selectedNotebookId} />
        </>
      ) : (
        <EmptyNotebooks
          refresh={async () => {
            await refetch();
          }}
          type="no data"
        />
      )}
    </div>
  );
}
