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
      className="h-1/4 flex flex-col pt-8 pb-0 gap-2 border-r border-b"
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
              return (
                <li key={notebook.id}>
                  <Button
                    aria-pressed={isSelected}
                    className="w-full flex justify-between items-center gap-0.5 px-3 rounded-none cursor-pointer"
                    onClick={() => {
                      selection?.onRowSelectionChange({
                        [notebook.id]: true,
                      });
                    }}
                    variant="ghost"
                  >
                    <span
                      className={cn(
                        "text-xs leading-snug truncate w-full text-left",
                        { "text-muted-foreground": !isSelected }
                      )}
                    >
                      {notebook.title}
                    </span>
                    {isSelected ? <Check className="size-4" /> : null}
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
