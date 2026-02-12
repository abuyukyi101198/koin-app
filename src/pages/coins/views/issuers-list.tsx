import { useState } from "react";

import { ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useListIssuers } from "@/query/commands";
import { Issuer } from "@/query/types";

export function IssuersList() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data } = useListIssuers();

  const renderItem = (issuer: Issuer | Omit<Issuer, "predecessors">) => {
    if (
      "predecessors" in issuer &&
      issuer.predecessors &&
      issuer.predecessors.length
    ) {
      return (
        <Collapsible key={issuer.id}>
          <CollapsibleTrigger asChild>
            <Button
              className="text-foreground font-normal w-full justify-start gap-2 pl-5.5 max-w-full cursor-pointer"
              size="xs"
              variant="ghost"
            >
              <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
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
                  <span className="truncate">{issuer.name}</span>
                </div>
                {issuer.name !== "Other" && (
                  <span className="text-xs italic text-muted-foreground text-right leading-5 grow">
                    ({issuer.start_year}-{issuer.end_year ?? "pres."})
                  </span>
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="style-lyra:ml-4 mt-1 ml-5">
            <div className="flex flex-col gap-1">
              {issuer.predecessors?.map((child) => renderItem(child))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }
    return (
      <Button
        className="text-foreground font-normal w-full justify-start gap-2 pl-5.5 max-w-full"
        key={issuer.id}
        size="xs"
        variant="ghost"
      >
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
            <span className="truncate">{issuer.name}</span>
          </div>
          {issuer.name !== "Other" && (
            <span className="text-xs italic text-muted-foreground leading-5">
              ({issuer.start_year}-{issuer.end_year ?? "pres."})
            </span>
          )}
        </div>
      </Button>
    );
  };

  return (
    <div className="h-full max-w-full pl-6 pt-6 flex flex-col">
      <div className="max-w-full flex items-center pb-3.5 pr-6 gap-2.5">
        <Input
          className="max-w-full"
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          placeholder="Search..."
          value={searchQuery}
        />
      </div>
      <ScrollArea className="w-full overflow-hidden">
        <div className="mr-6 mb-6 flex flex-col gap-2">
          {data?.items.map((item) => renderItem(item))}
        </div>
      </ScrollArea>
    </div>
  );
}
