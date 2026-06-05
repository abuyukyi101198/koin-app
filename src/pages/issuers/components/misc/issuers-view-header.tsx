import { Dispatch, SetStateAction } from "react";

import { SearchInput } from "@/components/composite/search-input.tsx";

interface CoinsViewHeaderProps {
  total: number;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

export function IssuersViewHeader({
  total,
  searchQuery,
  setSearchQuery,
}: CoinsViewHeaderProps) {
  return (
    <header className="shrink-0 flex flex-col border-b">
      <div className="w-full flex justify-between items-baseline border-b">
        <h1 className="pb-2 scroll-m-20 text-2xl font-serif font-medium tracking-wide text-balance">
          All Issuers
        </h1>
        <p className="text-muted-foreground text-xs">Issuers are readonly.</p>
      </div>
      <div
        aria-label="Table controls"
        className="pt-2 pr-2.5 pb-2 flex items-center gap-2.5"
        role="toolbar"
      >
        <SearchInput
          aria-describedby="search-help"
          count={total}
          onSearch={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search issuers..."
          search={searchQuery}
        />
        <span className="sr-only" id="search-help">
          Search by name, year, or continent
        </span>
      </div>
    </header>
  );
}
