import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import { useNotebookSelection } from "@/context/notebook-selection-context.tsx";
import { EmptyNotebooks } from "@/pages/notebooks/components/misc/empty-notebooks.tsx";
import { NotebookContentsHeader } from "@/pages/notebooks/components/misc/notebook-contents-header.tsx";
import { NotebookGrid } from "@/pages/notebooks/components/misc/notebook-grid.tsx";
import {
  useGetNotebook,
  useListNotebooks,
} from "@/query/commands/notebooks.ts";

interface NotebookContentsProps {
  notebookId: number | null;
  onRefresh?: () => void;
}

export function NotebookContents({
  notebookId,
  onRefresh,
}: NotebookContentsProps) {
  const { contentsPage: page, setContentsPage: setPage } =
    useNotebookSelection();
  const { data: notebook, isLoading: notebookIsLoading } = useGetNotebook({
    id: notebookId ?? -1,
  });
  const { data: allNotebooks, isLoading: allNotebooksIsLoading } =
    useListNotebooks({ pageSize: 5, page: 0 });

  return (
    <section
      aria-busy={notebookIsLoading}
      aria-label="Notebook contents"
      className="h-full w-full flex flex-col"
    >
      {notebookId === null ? (
        <div
          aria-live="polite"
          className="pt-35.5 pr-2.5 flex h-full items-start justify-center"
          role="status"
        >
          <EmptyNotebooks onRefresh={onRefresh} type="no data" />
        </div>
      ) : notebookIsLoading ? (
        <NotebookContents.Skeleton />
      ) : (
        <>
          <NotebookContentsHeader
            allNotebooks={allNotebooks?.items ?? []}
            allNotebooksLoading={allNotebooksIsLoading}
            notebook={notebook}
            notebookId={notebookId}
          />
          <NotebookGrid notebook={notebook} page={page} />
        </>
      )}
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

NotebookContents.Skeleton = ({
  rows,
  cols,
}: {
  rows?: number;
  cols?: number;
}) => {
  return (
    <div aria-hidden="true" className="flex-1 flex flex-col overflow-hidden">
      <NotebookContentsHeader.Skeleton />
      <NotebookGrid.Skeleton cols={cols} rows={rows} />
    </div>
  );
};
