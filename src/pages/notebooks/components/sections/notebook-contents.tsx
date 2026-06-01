import { useEffect } from "react";

import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import usePagination from "@/hooks/use-pagination.ts";
import { NotebookContentsHeader } from "@/pages/notebooks/components/misc/notebook-contents-header.tsx";
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
      className="h-full w-full flex flex-col overflow-hidden"
    >
      <NotebookContentsHeader notebookId={notebookId} />

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
