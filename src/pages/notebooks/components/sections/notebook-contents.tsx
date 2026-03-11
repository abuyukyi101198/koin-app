import { useCallback, useState } from "react";

import { X } from "lucide-react";

import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import { Button } from "@/components/ui/button.tsx";
import usePagination from "@/hooks/use-pagination.ts";
import { NotebookGrid } from "@/pages/notebooks/components/misc/notebook-grid.tsx";
import { useGetNotebook } from "@/query/commands/notebooks.ts";

interface NotebookContentsProps {
  notebookId: number;
}

export function NotebookContents({ notebookId }: NotebookContentsProps) {
  const { page, setPage } = usePagination();
  const { data: notebook, isLoading } = useGetNotebook({ id: notebookId });

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleSelect = useCallback((coinId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(coinId) ? next.delete(coinId) : next.add(coinId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return (
    <section
      aria-busy={isLoading}
      aria-label="Notebook contents"
      className="h-full w-7/12 flex flex-col overflow-hidden border-r"
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

      {/* Selection bar */}
      <div className="shrink-0 h-8 flex items-center gap-2 px-6 py-2 border-b bg-muted/30 text-sm">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {selectedIds.size}
          </span>{" "}
          selected
        </span>
        {selectedIds.size > 0 && (
          <Button
            className="ml-auto h-6 gap-1 text-xs"
            onClick={clearSelection}
            size="xs"
            variant="ghost"
          >
            <X className="size-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Grid */}
      {notebook ? (
        <NotebookGrid
          notebook={notebook}
          onSelect={handleSelect}
          page={page}
          selectedIds={selectedIds}
        />
      ) : null}

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
