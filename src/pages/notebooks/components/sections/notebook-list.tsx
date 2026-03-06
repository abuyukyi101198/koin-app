import { useState } from "react";

import { DataTableProps } from "@/components/composite/data-table.tsx";
import { SearchInput } from "@/components/composite/search-input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
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
      className="h-full w-1/6 flex flex-col pt-8 pb-0 px-2 gap-2 border-r"
    >
      {/* Header */}
      <header className="max-w-full flex items-center gap-2.5">
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
      <ScrollArea className="flex-1">
        {!isLoading && !notebooks?.items.length ? (
          <EmptyNotebooks
            type={debouncedSearchQuery.length ? "no match" : "no data"}
          />
        ) : (
          <ul className="flex flex-col gap-1.5 pb-2">
            {(notebooks?.items ?? []).map((notebook: Notebook) => {
              const isSelected = notebook.id === notebookId;
              return (
                <li key={notebook.id}>
                  <Button
                    aria-pressed={isSelected}
                    className="w-full h-auto min-h-10 flex flex-col items-start gap-0.5 px-3 py-2 cursor-pointer"
                    onClick={() => {
                      selection?.onRowSelectionChange({
                        [notebook.id]: true,
                      });
                    }}
                    variant={isSelected ? "default" : "outline"}
                  >
                    <span className="text-sm font-medium leading-snug truncate w-full text-left">
                      {notebook.title}
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
