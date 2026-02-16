import { useMemo, useState } from "react";

import { ChevronRightIcon, Search } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { cn } from "@/lib/utils.ts";
import { useListIssuers } from "@/query/commands";
import { Issuer } from "@/query/types";

function IssuerItem({
  issuer,
}: {
  issuer: Issuer | Omit<Issuer, "predecessors">;
}) {
  return (
    <div className="w-full flex justify-between">
      <div className="flex items-start gap-2 pt-0.5">
        <span>
          <img
            alt={`${issuer.name} flag`}
            className="h-4 w-6"
            loading="lazy"
            src={issuer.flag?.length ? issuer.flag : undefined}
          />
        </span>
        <span>
          {issuer.name.length > 30
            ? `${issuer.name.substring(0, 30).trimEnd()}...`
            : issuer.name}
        </span>
      </div>
      {issuer.name !== "Other" && (
        <span className="text-xs italic text-muted-foreground text-right leading-5 grow">
          ({issuer.start_year}-{issuer.end_year ?? "pres."})
        </span>
      )}
    </div>
  );
}

export function IssuersList() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openCollapsibles, setOpenCollapsibles] = useState<Set<number>>(
    new Set()
  );
  const { data } = useListIssuers();

  // Helper function to check if an issuer or its predecessors match the search

  const issuers = useMemo(() => {
    const matchesSearch = (
      issuer: Issuer | Omit<Issuer, "predecessors">
    ): boolean => {
      return (
        issuer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ("predecessors" in issuer &&
          issuer.predecessors &&
          issuer.predecessors.some((pred) =>
            pred.name.toLowerCase().includes(searchQuery.toLowerCase())
          ))
      );
    };
    return data?.items.filter(matchesSearch);
  }, [data?.items, searchQuery]);

  const totalResultsCount = useMemo(() => {
    let count = 0;
    issuers?.forEach((issuer) => {
      count += 1; // Count the main issuer
      if ("predecessors" in issuer && issuer.predecessors) {
        // Count filtered predecessors
        const filteredPredecessors = issuer.predecessors.filter((pred) =>
          pred.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        count += filteredPredecessors.length;
      }
    });
    return count;
  }, [issuers, searchQuery]);

  // Auto-open collapsibles when search query exists and has matching predecessors
  useMemo(() => {
    if (searchQuery.trim() === "") {
      // Clear auto-opened collapsibles when search is cleared
      setOpenCollapsibles(new Set());
    } else {
      // Auto-open collapsibles with matching predecessors
      const toOpen = new Set<number>();
      data?.items.forEach((issuer) => {
        if (
          "predecessors" in issuer &&
          issuer.predecessors &&
          issuer.predecessors.some((pred) =>
            pred.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        ) {
          toOpen.add(issuer.id);
        }
      });
      setOpenCollapsibles(toOpen);
    }
  }, [searchQuery, data?.items]);

  const renderItem = (issuer: Issuer | Omit<Issuer, "predecessors">) => {
    const buttonProps = {
      className:
        "text-foreground font-normal w-full justify-start gap-2 max-w-full rounded-none h-8 pr-6!",
      size: "xs" as const,
      variant: "ghost" as const,
    };

    // Filter predecessors based on search query
    const filteredPredecessors =
      "predecessors" in issuer && issuer.predecessors
        ? issuer.predecessors.filter((pred) =>
            pred.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : null;

    if ("predecessors" in issuer && filteredPredecessors?.length) {
      const isOpen = openCollapsibles.has(issuer.id);

      return (
        <Collapsible
          key={issuer.id}
          onOpenChange={(open) => {
            const newOpen = new Set(openCollapsibles);
            if (open) {
              newOpen.add(issuer.id);
            } else {
              newOpen.delete(issuer.id);
            }
            setOpenCollapsibles(newOpen);
          }}
          open={isOpen}
        >
          <CollapsibleTrigger asChild>
            <Button
              {...buttonProps}
              className={cn(buttonProps.className, "group cursor-pointer")}
            >
              <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90 text-muted-foreground" />
              <IssuerItem issuer={issuer} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-1">
              {filteredPredecessors?.map((child) => renderItem(child))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={issuer.id}
        {...buttonProps}
        className={cn(buttonProps.className, {
          "pl-6.5": "predecessors" in issuer && issuer.predecessors !== null,
          "pl-9.5": "predecessors" in issuer && issuer.predecessors === null,
        })}
      >
        <IssuerItem issuer={issuer} />
      </Button>
    );
  };

  return (
    <div className="h-full max-w-full flex flex-col pt-4 pb-0">
      <div className="max-w-full flex items-center pl-2 pr-5 gap-2.5 mt-[0.5px]">
        <InputGroup className="w-full border-l-0 border-t-0 border-r-0 rounded-none bg-background! has-[[data-slot=input-group-control]:focus-visible]:ring-0">
          <InputGroupAddon className="pl-1.5">
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search issuers..."
            value={searchQuery}
          />
          <InputGroupAddon
            align="inline-end"
            className="text-xs font-normal leading-5 italic pt-2.5 pr-1.5"
          >
            {totalResultsCount} results
          </InputGroupAddon>
        </InputGroup>
      </div>
      <ScrollArea className="w-full overflow-hidden">
        <div className="flex flex-col border-collapse gap-0 py-2">
          {issuers?.map((item) => renderItem(item))}
        </div>
      </ScrollArea>
    </div>
  );
}
