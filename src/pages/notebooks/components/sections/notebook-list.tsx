import { useState } from "react";

import { SearchInput } from "@/components/composite/search-input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { useListNotebooks } from "@/query/commands/notebooks.ts";
import { ListNotebooksRequest, Notebook } from "@/query/types/notebooks.ts";

function NotebookItem({ notebook }: { notebook: Notebook }) {
  const displayTitle =
    notebook.title.length > 30
      ? `${notebook.title.substring(0, 30).trimEnd()}...`
      : notebook.title;

  const displayDescription =
    notebook.description && notebook.description.length > 30
      ? `${notebook.description.substring(0, 30).trimEnd()}...`
      : notebook.description;

  return (
    <div className="w-full flex justify-between">
      <span title={notebook.title.length > 30 ? notebook.title : undefined}>
        {displayTitle}
      </span>
      {notebook.description && (
        <span
          className="text-xs italic text-muted-foreground text-right leading-5 grow"
          title={
            notebook.description.length > 30 ? notebook.description : undefined
          }
        >
          {displayDescription}
        </span>
      )}
    </div>
  );
}

export function NotebooksList() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { page, size } = usePagination(10);

  const listNotebooksOptions: ListNotebooksRequest = {
    search: debouncedSearchQuery || undefined,
    page: page - 1,
    pageSize: size,
  };

  const { data, isLoading } = useListNotebooks(listNotebooksOptions);

  const renderItem = (notebook: Notebook) => (
    <NotebookItem notebook={notebook} />
  );

  return (
    <section
      aria-busy={isLoading}
      aria-label="Notebooks catalogue"
      className="h-full w-1/4 flex flex-col pt-4 pb-0 gap-2 border-r"
    >
      {/* Header */}
      <header className="max-w-full flex items-center pl-2 pr-5 gap-2.5">
        <SearchInput
          aria-describedby="notebook-search-help"
          count={data?.total}
          onSearch={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search notebooks..."
          search={searchQuery}
        />
        <span className="sr-only" id="notebook-search-help">
          Search by notebook name or description
        </span>
      </header>

      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {data?.total} issuer{data?.total !== 1 ? "s" : ""} found
      </div>

      {/* Notebooks list */}
      <ScrollArea className="w-full overflow-hidden">
        <div className="flex flex-col border-collapse gap-0 pb-2">
          {data?.items?.map((item) => renderItem(item))}
        </div>
      </ScrollArea>
    </section>
  );
}
