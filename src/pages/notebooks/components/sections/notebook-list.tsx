import { useState } from "react";

import {
  DataTable,
  DataTableProps,
} from "@/components/composite/data-table.tsx";
import { SearchInput } from "@/components/composite/search-input.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { EmptyNotebooks } from "@/pages/notebooks/components/misc/empty-notebooks.tsx";
import { useNotebooksTableColumns } from "@/pages/notebooks/hooks/use-notebooks-table-columns.tsx";
import { useListNotebooks } from "@/query/commands/notebooks.ts";
import { ListNotebooksRequest, Notebook } from "@/query/types/notebooks.ts";

interface NotebookListProps {
  selection: DataTableProps<Notebook>["selection"];
}

export function NotebooksList({ selection }: NotebookListProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { page, size } = usePagination(10);

  const listNotebooksOptions: ListNotebooksRequest = {
    search: debouncedSearchQuery || undefined,
    page: page - 1,
    pageSize: size,
  };

  const { data, isLoading, refetch } = useListNotebooks(listNotebooksOptions);

  const columns = useNotebooksTableColumns();

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
      <DataTable<Notebook>
        aria-label="Notebooks list"
        className="[&_tr_td]:py-3"
        columns={columns}
        data={data?.items ?? []}
        empty={
          <EmptyNotebooks
            refresh={async () => {
              await refetch();
            }}
            type={debouncedSearchQuery.length ? "no match" : "no data"}
          />
        }
        header={false}
        loading={isLoading}
        selection={selection}
      />
    </section>
  );
}
