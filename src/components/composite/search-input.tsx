import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";

import { Search, X } from "lucide-react";

import { ButtonGroup } from "@/components/ui/button-group.tsx";
import { Button } from "@/components/ui/button.tsx";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleBlur = () => {
    if (!search) {
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    if (inputRef.current && nativeInputValueSetter) {
      nativeInputValueSetter.call(inputRef.current, "");
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    onSearch(syntheticEvent);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <ButtonGroup className="w-full justify-end gap-0!">
      <ButtonGroup>
        <Button
          className="text-muted-foreground cursor-pointer p-0"
          onClick={handleIconClick}
          size="icon"
          variant="ghost"
        >
          <Search />
        </Button>
      </ButtonGroup>
      <ButtonGroup
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded || search ? "w-full" : "w-0"
        }`}
      >
        <InputGroup className="border-l-0 border-t-0 border-r-0 rounded-none bg-background! has-[[data-slot=input-group-control]:focus-visible]:ring-0">
          <InputGroupInput
            onBlur={handleBlur}
            onChange={onSearch}
            onFocus={() => {
              setIsExpanded(true);
            }}
            placeholder={placeholder ?? "Search..."}
            ref={inputRef}
            value={search}
          />
          {search && count !== undefined && (
            <>
              <InputGroupAddon
                align="inline-end"
                className="items-baseline pb-1"
              >
                <Button
                  className="h-4 text-muted-foreground cursor-pointer p-0 hover:text-foreground"
                  onClick={handleClear}
                  size="icon-sm"
                  variant="link"
                >
                  <X className="size-4" />
                </Button>
              </InputGroupAddon>
              <InputGroupAddon
                align="inline-end"
                className="text-xs font-normal leading-5 italic pt-2.5 pr-1.5"
              >
                {count} results
              </InputGroupAddon>
            </>
          )}
        </InputGroup>
      </ButtonGroup>
    </ButtonGroup>
  );
}
