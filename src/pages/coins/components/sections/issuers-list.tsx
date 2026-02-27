import { useMemo, useState } from "react";

import { ChevronRightIcon } from "lucide-react";

import { SearchInput } from "@/components/composite/search-input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";
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
      <div className="max-w-3/4 flex items-start gap-2 pt-0.5">
        <img
          alt={`${issuer.name} flag`}
          className="h-4 w-6"
          loading="lazy"
          src={issuer.flag?.length ? issuer.flag : undefined}
        />
        <span className="text-left truncate">{issuer.name}</span>
      </div>
      {issuer.name !== "Other" && (
        <span
          aria-label={`Years of issue: ${issuer.start_year} to ${issuer.end_year ? issuer.end_year : "present"}`}
          className="text-xs italic text-muted-foreground text-right leading-5"
        >
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

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data } = useListIssuers();

  const issuers = useMemo(() => {
    const matchesSearch = (
      issuer: Issuer | Omit<Issuer, "predecessors">
    ): boolean => {
      return (
        issuer.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        ("predecessors" in issuer &&
          issuer.predecessors &&
          issuer.predecessors.some((pred) =>
            pred.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          ))
      );
    };
    return data?.items.filter(matchesSearch);
  }, [data?.items, debouncedSearchQuery]);

  const totalResultsCount = useMemo(() => {
    let count = 0;
    issuers?.forEach((issuer) => {
      count += 1;
      if ("predecessors" in issuer && issuer.predecessors) {
        const filteredPredecessors = issuer.predecessors.filter((pred) =>
          pred.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
        count += filteredPredecessors.length;
      }
    });
    return count;
  }, [issuers, debouncedSearchQuery]);

  useMemo(() => {
    if (debouncedSearchQuery.trim() === "") {
      setOpenCollapsibles(new Set());
    } else {
      const toOpen = new Set<number>();
      data?.items.forEach((issuer) => {
        if (
          "predecessors" in issuer &&
          issuer.predecessors &&
          issuer.predecessors.some((pred) =>
            pred.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          )
        ) {
          toOpen.add(issuer.id);
        }
      });
      setOpenCollapsibles(toOpen);
    }
  }, [debouncedSearchQuery, data?.items]);

  const renderItem = (issuer: Issuer | Omit<Issuer, "predecessors">) => {
    const buttonProps = {
      className:
        "text-foreground font-normal w-full justify-start gap-2 max-w-full rounded-none h-8 pr-6!",
      size: "xs" as const,
      variant: "ghost" as const,
    };

    const filteredPredecessors =
      "predecessors" in issuer && issuer.predecessors
        ? issuer.predecessors.filter((pred) =>
            pred.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
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
              aria-label={`${issuer.name}, ${filteredPredecessors.length} predecessor${filteredPredecessors.length !== 1 ? "s" : ""}`}
              className={cn(buttonProps.className, "group cursor-pointer")}
            >
              <ChevronRightIcon
                aria-hidden="true"
                className="transition-transform group-data-[state=open]:rotate-90 text-muted-foreground"
              />
              <IssuerItem issuer={issuer} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col gap-1">
              {filteredPredecessors?.map((child) => (
                <li key={child.id}>{renderItem(child)}</li>
              ))}
            </ul>
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
    <section
      aria-label="Issuers catalogue"
      className="h-full w-1/4 flex flex-col pt-4 pb-0 gap-2"
    >
      <header className="max-w-full flex items-center pl-2 pr-5 gap-2.5">
        <SearchInput
          aria-describedby="issuer-search-help"
          count={totalResultsCount}
          onSearch={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search issuers..."
          search={searchQuery}
        />
        <span className="sr-only" id="issuer-search-help">
          Search by issuer name
        </span>
      </header>

      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {totalResultsCount} issuer{totalResultsCount !== 1 ? "s" : ""} found
      </div>

      {/* Issuers list */}
      <ScrollArea className="w-full overflow-hidden">
        <div className="flex flex-col border-collapse gap-0 pb-2">
          {issuers?.map((item) => renderItem(item))}
        </div>
      </ScrollArea>
    </section>
  );
}
