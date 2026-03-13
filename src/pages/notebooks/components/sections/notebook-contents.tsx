import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import usePagination from "@/hooks/use-pagination.ts";
import { NotebookGrid } from "@/pages/notebooks/components/misc/notebook-grid.tsx";
import { useGetNotebook } from "@/query/commands/notebooks.ts";

interface NotebookContentsProps {
  notebookId: number;
}

export function NotebookContents({ notebookId }: NotebookContentsProps) {
  const { page, setPage } = usePagination();
  const { data: notebook, isLoading } = useGetNotebook({ id: notebookId });

  return (
    <section
      aria-busy={isLoading}
      aria-label="Notebook contents"
      className="h-full w-7/12 flex flex-col overflow-hidden border-r"
    >
      {/* Header */}
      <header className="shrink-0 border-b px-6 pt-8 pb-3">
        <h2 className="h-8 text-2xl font-medium tracking-wide">
          {notebook?.title}
        </h2>
        <p className="h-7 text-lg italic text-muted-foreground">
          {notebook?.description || "—"}
        </p>
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
