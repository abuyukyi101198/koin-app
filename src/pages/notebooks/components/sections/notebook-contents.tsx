import { useEffect } from "react";

import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import usePagination from "@/hooks/use-pagination.ts";
import { DeleteNotebookDialog } from "@/pages/notebooks/components/forms/delete-notebook-dialog.tsx";
import { UpdateNotebookDialog } from "@/pages/notebooks/components/forms/update-notebook-dialog.tsx";
import { NotebookGrid } from "@/pages/notebooks/components/misc/notebook-grid.tsx";
import { useGetNotebook } from "@/query/commands/notebooks.ts";

interface NotebookContentsProps {
  notebookId: number;
}

export function NotebookContents({ notebookId }: NotebookContentsProps) {
  const { page, setPage } = usePagination();
  const { data: notebook, isLoading } = useGetNotebook({ id: notebookId });

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId]);

  return (
    <section
      aria-busy={isLoading}
      aria-label="Notebook contents"
      className="h-full w-7/12 flex flex-col overflow-hidden border-r"
    >
      {/* Header */}
      <header className="w-full flex justify-between shrink-0 border-b px-6 pt-8 pb-3">
        <div className="space-y-1">
          <h2 className="scroll-m-20 text-2xl font-medium tracking-wide text-balance">
            {notebook?.title}
          </h2>
          <p className="text-lg font-normal italic text-muted-foreground">
            {notebook?.description || "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <UpdateNotebookDialog id={notebookId} size="sm" />
          <DeleteNotebookDialog id={notebookId} size="sm" />
        </div>
      </header>

      {/* Grid */}
      {notebook ? <NotebookGrid notebook={notebook} page={page} /> : null}

      <div aria-atomic="true" aria-live="polite">
        <DataTablePagination
          onPaginationChange={async (pageIndex) => {
            setPage(pageIndex);
          }}
          pageCount={notebook?.number_of_pages ?? 1}
          pageIndex={page}
        />
      </div>
    </section>
  );
}
