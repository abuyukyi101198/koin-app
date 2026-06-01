import { Dispatch, SetStateAction } from "react";

import { Grid2X2, List } from "lucide-react";

import { SearchInput } from "@/components/composite/search-input.tsx";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { CreateCoinDialog } from "@/pages/coins/components/forms/create-coin-dialog.tsx";

interface CoinsViewHeaderProps {
  setView: Dispatch<SetStateAction<"gallery" | "table">>;
  total: number;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

export function CoinsViewHeader({
  setView,
  total,
  searchQuery,
  setSearchQuery,
}: CoinsViewHeaderProps) {
  return (
    <header className="shrink-0 flex flex-col border-b">
      <div className="w-full flex justify-between border-b">
        <h1 className="pb-2 scroll-m-20 text-2xl font-serif font-medium tracking-wide text-balance">
          All Coins
        </h1>
        <CreateCoinDialog size="sm" />
      </div>
      <div
        aria-label="Table controls"
        className="pt-2 pr-2.5 pb-2 flex items-center gap-2.5"
        role="toolbar"
      >
        <RadioGroup
          aria-label="View mode"
          className="max-w-sm flex flex-row"
          defaultValue="table"
          onValueChange={(value) => {
            setView(value === "table" ? "table" : "gallery");
          }}
        >
          <FieldLabel
            className="hover:bg-muted has-data-[state=checked]:border-none! has-data-[state=checked]:m-px! has-data-[state=checked]:bg-accent/50! focus-within:ring-2 focus-within:ring-ring/50 focus-within:rounded-sm"
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
                className="sr-only"
                id="table-view"
                value="table"
              />
            </Field>
          </FieldLabel>
          <FieldLabel
            className="hover:bg-muted has-data-[state=checked]:border-none! has-data-[state=checked]:m-px! has-data-[state=checked]:bg-accent/50! focus-within:ring-2 focus-within:ring-ring/50 focus-within:rounded-sm"
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
                className="sr-only"
                id="gallery-view"
                value="gallery"
              />
            </Field>
          </FieldLabel>
        </RadioGroup>
        <SearchInput
          aria-describedby="search-help"
          count={total}
          onSearch={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search coins..."
          search={searchQuery}
        />
        <span className="sr-only" id="search-help">
          Search by issuer, year, or value
        </span>
      </div>
    </header>
  );
}
