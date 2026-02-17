import { ChangeEventHandler } from "react";

import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";

interface SearchInputProps {
  count?: number;
  onSearch: ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
  placeholder?: string;
  search: string;
}

export function SearchInput({
  search,
  onSearch,
  placeholder,
  count,
}: SearchInputProps) {
  return (
    <InputGroup className="w-full border-l-0 border-t-0 border-r-0 rounded-none bg-background! has-[[data-slot=input-group-control]:focus-visible]:ring-0">
      <InputGroupAddon className="pl-1.5">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        onChange={onSearch}
        placeholder={placeholder ?? "Search..."}
        value={search}
      />
      {count && (
        <InputGroupAddon
          align="inline-end"
          className="text-xs font-normal leading-5 italic pt-2.5 pr-1.5"
        >
          {count} results
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
