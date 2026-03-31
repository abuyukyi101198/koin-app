import { useState } from "react";

import { Check } from "lucide-react";

import { DataTableProps } from "@/components/composite/data-table.tsx";
import { SearchInput } from "@/components/composite/search-input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { cn } from "@/lib/utils.ts";
import { CreateNotebookDialog } from "@/pages/notebooks/components/forms/create-notebook-dialog.tsx";
import { EmptyNotebooks } from "@/pages/notebooks/components/misc/empty-notebooks.tsx";
import { useListNotebooks } from "@/query/commands/notebooks.ts";
import { ListNotebooksRequest, Notebook } from "@/query/types/notebooks.ts";

interface NotebookListProps {
  notebookId: number;
  selection: DataTableProps<Notebook>["selection"];
}

export function NotebooksList({ notebookId, selection }: NotebookListProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { page, size } = usePagination(10);

  const listNotebooksOptions: ListNotebooksRequest = {
    search: debouncedSearchQuery || undefined,
    page: page - 1,
    pageSize: size,
  };

  const { data: notebooks, isLoading } = useListNotebooks(listNotebooksOptions);

  return (
    <section
      aria-busy={isLoading}
      aria-label="Notebooks catalogue"
      className="h-full w-1/6 flex flex-col pt-4 pb-0 gap-2 border-r"
    >
      {/* Header */}
      <header className="max-w-full flex items-center px-2 gap-2.5">
        <SearchInput
          aria-describedby="notebook-search-help"
          count={notebooks?.total}
          onSearch={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search notebooks..."
          search={searchQuery}
        />
        <span className="sr-only" id="notebook-search-help">
          Search by notebook name or description
        </span>
        <CreateNotebookDialog size="sm" />
      </header>

      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {notebooks?.total} notebook{notebooks?.total !== 1 ? "s" : ""} found
      </div>

      {/* Notebook slot list */}
      <ScrollArea className="flex-1 overflow-hidden">
        {!isLoading && !notebooks?.items.length ? (
          <EmptyNotebooks
            type={debouncedSearchQuery.length ? "no match" : "no data"}
          />
        ) : (
          <ul className="flex flex-col pb-2">
            {(notebooks?.items ?? []).map((notebook: Notebook) => {
              const isSelected = notebook.id === notebookId;
              const capacity =
                notebook.rows_per_page *
                notebook.columns_per_page *
                notebook.number_of_pages;
              const fillPct =
                capacity > 0
                  ? Math.round((notebook.coin_count / capacity) * 100)
                  : 0;
              const gridSpec = `${notebook.rows_per_page}×${notebook.columns_per_page}`;
              const pages = `${notebook.number_of_pages} pp`;
              const date = new Date(notebook.created_at).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              );
              return (
                <li key={notebook.id}>
                  <Button
                    aria-pressed={isSelected}
                    className="w-full flex flex-col items-stretch gap-0.5 px-3 py-5 h-auto rounded-none cursor-pointer"
                    onClick={() => {
                      selection?.onRowSelectionChange({
                        [notebook.id]: true,
                      });
                    }}
                    variant="ghost"
                  >
                    <span className="flex items-center gap-1 w-full">
                      <span
                        className={cn(
                          "text-xs font-medium leading-snug truncate text-left flex-1",
                          { "text-muted-foreground": !isSelected }
                        )}
                      >
                        {notebook.title}
                      </span>
                      <span className="size-3 shrink-0 flex items-center justify-center">
                        {isSelected && <Check className="size-3" />}
                      </span>
                    </span>
                    <span className="flex items-start gap-2 w-full">
                      <span className="text-xs italic leading-snug text-left text-muted-foreground wrap-break-word whitespace-normal flex-1 min-w-0 line-clamp-2 overflow-hidden">
                        {notebook.description?.length
                          ? notebook.description
                          : "—"}
                      </span>
                      <span className="flex flex-col items-end gap-0 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {gridSpec} · {pages}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {date}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 w-full pt-0.5">
                      <span className="relative flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full bg-foreground/40 transition-all duration-300"
                          style={{ width: `${fillPct}%` }}
                        />
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                        {notebook.coin_count}/{capacity}
                      </span>
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </section>
  );
}
