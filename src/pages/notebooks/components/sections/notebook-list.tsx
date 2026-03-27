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
      className="h-full flex flex-col pt-8 pb-0 gap-2 border-r border-b"
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
                    className="w-full flex items-end justify-between gap-2 px-3 py-2.5 h-auto rounded-none cursor-pointer"
                    onClick={() => {
                      selection?.onRowSelectionChange({
                        [notebook.id]: true,
                      });
                    }}
                    variant="ghost"
                  >
                    <span className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                      <span className="flex items-center gap-1 w-full">
                        <span
                          className={cn(
                            "text-xs font-medium leading-snug truncate text-left flex-1",
                            { "text-muted-foreground": !isSelected }
                          )}
                        >
                          {notebook.title}
                        </span>
                      </span>
                      <span className="text-xs italic leading-snug text-left text-muted-foreground wrap-break-word whitespace-normal w-full line-clamp-2 overflow-hidden">
                        {notebook.description?.length
                          ? notebook.description
                          : "—"}
                      </span>
                    </span>
                    <span className="flex flex-col justify-end items-end gap-0.5 shrink-0">
                      {isSelected && <Check className="size-3 shrink-0" />}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {gridSpec} · {pages}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {date}
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
