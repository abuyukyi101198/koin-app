import { useMemo, useState, useTransition } from "react";

import { Coins } from "lucide-react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIssuerSelection } from "@/context/issuer-selection-context.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { IssuerPagination } from "@/pages/issuers/components/misc/issuer-pagination.tsx";
import { IssuersViewHeader } from "@/pages/issuers/components/misc/issuers-view-header.tsx";
import { IssuersTable } from "@/pages/issuers/components/sections/issuers-table.tsx";
import { useListIssuers } from "@/query/commands";
import { ListIssuersRequest } from "@/query/types";

export function IssuersView() {
  const { rowSelection, setRowSelection } = useIssuerSelection();
  const [issuerSearchQuery, setIssuerSearchQuery] = useState<string>("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [isFilterPending, startFilterTransition] = useTransition();

  const debouncedSearchQuery = useDebounce(issuerSearchQuery, 300);

  const listIssuersOptions: ListIssuersRequest = {
    search: debouncedSearchQuery || undefined,
  };

  const { data, isLoading, refetch } = useListIssuers(listIssuersOptions);

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!activeLetter || debouncedSearchQuery.length) return items;
    return items.filter((item) =>
      item.name.toUpperCase().startsWith(activeLetter)
    );
  }, [data?.items, activeLetter, debouncedSearchQuery.length]);

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
          <Coins aria-hidden="true" className="size-3" />
          All Issuers
        </TabsTrigger>
      </TabsList>
      <Separator className="bg-primary" />
      <TabsContent
        className="flex flex-col overflow-hidden pl-6 bg-background"
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
            <IssuersViewHeader
              searchQuery={issuerSearchQuery}
              setSearchQuery={setIssuerSearchQuery}
              total={activeLetter ? filteredItems.length : (data?.total ?? 0)}
            />
            <IssuersTable
              data={filteredItems}
              loading={isLoading || isFilterPending}
              onRefresh={refetch}
              searchQuery={debouncedSearchQuery}
              selection={{
                rowSelection,
                onRowSelectionChange: setRowSelection,
              }}
            />
            <IssuerPagination
              activeLetter={debouncedSearchQuery.length ? null : activeLetter}
              onLetterChange={(letter) => {
                startFilterTransition(() => {
                  setActiveLetter(letter);
                });
              }}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="h-full flex flex-col"
            defaultSize="25%"
            maxSize="50%"
            minSize="25%"
          >
            {/*<IssuerInfo*/}
            {/*  issuerId={selectedIssuerId}*/}
            {/*  selection={{*/}
            {/*    rowSelection,*/}
            {/*    onRowSelectionChange: setRowSelection,*/}
            {/*  }}*/}
            {/*/>*/}
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabsContent>
    </Tabs>
  );
}
