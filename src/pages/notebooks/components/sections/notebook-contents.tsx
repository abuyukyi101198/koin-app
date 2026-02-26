import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import usePagination from "@/hooks/use-pagination.ts";
import {
  useGetNotebook,
  useGetNotebookPage,
} from "@/query/commands/notebooks.ts";
import { asFraction } from "@/utils/asFraction.tsx";

interface NotebookContentsProps {
  notebookId: number;
}

export function NotebookContents({ notebookId }: NotebookContentsProps) {
  const { page, setPage } = usePagination();

  const { data: notebook } = useGetNotebook({ id: notebookId });
  const { data: notebookPage, isLoading } = useGetNotebookPage({
    id: notebookId,
    page: page - 1,
  });

  const rows = notebook?.rows_per_page ?? 1;
  const cols = notebook?.columns_per_page ?? 1;

  return (
    <section
      aria-busy={isLoading}
      aria-label="Notebook contents"
      className="h-full w-5/6 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="shrink-0 border-b px-6 pt-8 pb-3">
        <h2 className="text-2xl font-medium tracking-wide">
          {notebook?.title}
        </h2>
        <p className="text-lg italic text-muted-foreground">
          {notebook?.description || "—"}
        </p>
      </header>

      {/* Grid Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 grid gap-2 p-6 max-h-full"
          role="grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {notebookPage?.cells.map(
            (row: (typeof notebookPage.cells)[number], rowIdx: number) =>
              row.map((coin: (typeof row)[number], colIdx: number) => (
                <div
                  className="relative flex items-start justify-center overflow-hidden rounded-sm border border-border bg-background"
                  key={`${rowIdx}-${colIdx}`}
                  role="gridcell"
                >
                  {coin ? (
                    <>
                      <div className="flex gap-2 mt-auto mb-auto px-2">
                        <div className="aspect-square flex items-center justify-center">
                          {coin.reverse_image ? (
                            <img
                              alt="Coin reverse"
                              className="max-w-full max-h-full object-contain rounded-full"
                              src={coin.reverse_image}
                            />
                          ) : (
                            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                              R
                            </div>
                          )}
                        </div>
                        <div className="aspect-square flex items-center justify-center">
                          {coin.obverse_image ? (
                            <img
                              alt="Coin obverse"
                              className="max-w-full max-h-full object-contain rounded-full"
                              src={coin.obverse_image}
                            />
                          ) : (
                            <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                              O
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute right-0 h-full max-w-1/3 bg-muted text-xs p-4">
                        <div className="flex gap-2 w-fit">
                          <span className="text-xs font-medium">
                            {asFraction(coin.title, coin.value)}
                          </span>
                          <span>
                            <img
                              alt={`${coin.issuer.name} flag`}
                              className="h-3 w-4.5"
                              loading="lazy"
                              src={
                                coin.issuer.flag?.length
                                  ? coin.issuer.flag
                                  : undefined
                              }
                            />
                          </span>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              ))
          )}
        </div>
      </div>
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
