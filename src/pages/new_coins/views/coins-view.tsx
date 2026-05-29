import { useCallback, useEffect, useState } from "react";

import { SortingState } from "@tanstack/react-table";
import { Coins, Grid2X2, List } from "lucide-react";

import { DataTablePagination } from "@/components/composite/data-table-pagination.tsx";
import { SearchInput } from "@/components/composite/search-input.tsx";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoinSelection } from "@/context/coin-selection-context.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import usePagination from "@/hooks/use-pagination.ts";
import { CoinsGallery } from "@/pages/new_coins/components/sections/coins-gallery.tsx";
import { CoinsTable } from "@/pages/new_coins/components/sections/coins-table.tsx";
import { useListCoins } from "@/query/commands";
import { ListCoinsRequest } from "@/query/types";

export function CoinsView() {
  const [view, setView] = useState<"gallery" | "table">("table");

  const { rowSelection, setRowSelection } = useCoinSelection();
  const [coinSearchQuery, setCoinSearchQuery] = useState<string>("");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "issuer", desc: false },
  ]);
  const debouncedSearchQuery = useDebounce(coinSearchQuery, 300);

  const { page, size, setPage, handlePageSizeChange } = usePagination(25);

  const listCoinsOptions: ListCoinsRequest = {
    search: debouncedSearchQuery || undefined,
    page: page - 1,
    pageSize: size,
    sortField: sorting.length > 0 ? sorting[0].id : "year",
    sortDirection: sorting.length > 0 && !sorting[0].desc ? "asc" : "desc",
  };

  const { data, isLoading } = useListCoins(listCoinsOptions);

  const handlePaginationChange = useCallback(
    async (pageIndex: number, pageSize: number) => {
      if (pageSize !== size) {
        handlePageSizeChange(pageSize);
        setPage(1);
      } else {
        setPage(pageIndex);
      }
    },
    [size, handlePageSizeChange, setPage]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, setPage]);

  return (
    <Tabs className="h-full w-full gap-0 bg-accent/50" defaultValue="all-coins">
      <TabsList
        className="ml-3 mt-2 mr-3 pb-0! gap-2 font-serif items-end border-collapse"
        variant="line"
      >
        <TabsTrigger
          className="p-2! bg-background! group-data-[orientation=horizontal]/tabs:after:inset-x-0.5px
          group-data-[orientation=horizontal]/tabs:after:-bottom-0.5 after:bg-background
          border-primary! border-b-0! rounded-t-md rounded-b-none cursor-pointer"
          value="all-coins"
        >
          <Coins className="size-3" />
          All Coins
        </TabsTrigger>
      </TabsList>
      <Separator className="bg-primary" />
      <TabsContent
        className="flex flex-col overflow-hidden pl-6 pr-4 bg-background"
        value="all-coins"
      >
        <ResizablePanelGroup
          className="flex-1 min-h-0"
          orientation="horizontal"
        >
          <ResizablePanel
            className="h-full pt-4 pr-4 flex flex-col"
            defaultSize="75%"
          >
            <header className="shrink-0 flex flex-col border-b">
              <div className="pb-2 flex flex-row items-end gap-4 border-b">
                <h1 className="scroll-m-20 text-2xl font-serif font-medium tracking-wide text-balance">
                  All Coins
                </h1>
                <p className="pb-1 font-sans text-sm text-muted-foreground">
                  {data?.total} items
                </p>
              </div>
              <div
                aria-label="Table controls"
                className="pt-2 pr-2.5 pb-2 flex items-center gap-2.5"
                role="toolbar"
              >
                <RadioGroup
                  className="max-w-sm flex flex-row"
                  defaultValue="table"
                  onValueChange={(value) => {
                    setView(value === "table" ? "table" : "gallery");
                  }}
                >
                  <FieldLabel
                    className="hover:bg-muted has-data-[state=checked]:border-none! has-data-[state=checked]:m-px! has-data-[state=checked]:bg-accent/50!"
                    htmlFor="table-view"
                  >
                    <Field
                      className="px-2.5! py-2! cursor-pointer text-muted-foreground has-data-[state=checked]:text-foreground hover:text-accent-foreground"
                      orientation="horizontal"
                    >
                      <FieldContent>
                        <FieldTitle className="text-xs!">
                          <List className="size-4" />
                          Table
                        </FieldTitle>
                      </FieldContent>
                      <RadioGroupItem
                        className="hidden"
                        id="table-view"
                        value="table"
                      />
                    </Field>
                  </FieldLabel>
                  <FieldLabel
                    className="hover:bg-muted has-data-[state=checked]:border-none! has-data-[state=checked]:m-px! has-data-[state=checked]:bg-accent/50!"
                    htmlFor="gallery-view"
                  >
                    <Field
                      className="px-2.5! py-2! cursor-pointer text-muted-foreground has-data-[state=checked]:text-foreground hover:text-accent-foreground"
                      orientation="horizontal"
                    >
                      <FieldContent>
                        <FieldTitle className="text-xs!">
                          <Grid2X2 className="size-4" />
                          Gallery
                        </FieldTitle>
                      </FieldContent>
                      <RadioGroupItem
                        className="hidden"
                        id="gallery-view"
                        value="gallery"
                      />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
                <SearchInput
                  aria-describedby="search-help"
                  count={data?.total}
                  onSearch={(e) => {
                    setCoinSearchQuery(e.target.value);
                  }}
                  placeholder="Search coins..."
                  search={coinSearchQuery}
                />
                <span className="sr-only" id="search-help">
                  Search by issuer, year, or value
                </span>
              </div>
            </header>
            {view === "table" ? (
              <CoinsTable
                data={data?.items ?? []}
                loading={isLoading}
                searchQuery={debouncedSearchQuery}
                selection={{
                  rowSelection,
                  onRowSelectionChange: setRowSelection,
                }}
                sort={{ sorting, onSortingChange: setSorting }}
              />
            ) : (
              <CoinsGallery
                data={data?.items ?? []}
                loading={isLoading}
                searchQuery={debouncedSearchQuery}
                selection={{
                  rowSelection,
                  onRowSelectionChange: setRowSelection,
                }}
              />
            )}
            <DataTablePagination
              onPaginationChange={handlePaginationChange}
              pageCount={Math.ceil((data?.total ?? 0) / size)}
              pageIndex={page}
              pageSize={size}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="25%">Two</ResizablePanel>
        </ResizablePanelGroup>
      </TabsContent>
    </Tabs>
  );
}
