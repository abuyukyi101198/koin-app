import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox.tsx";
import { useListIssuers } from "@/query/commands";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Issuer } from "@/query/types";
import { SearchIcon } from "lucide-react";

interface IssuerFieldProps {
  value: Issuer | null;
  onChange?: (value: Issuer | null) => void;
  required?: boolean | undefined;
}

const IssuerItemContent = ({
  issuer,
}: {
  issuer: Issuer | Omit<Issuer, "predecessors">;
}) => (
  <div className="w-full flex justify-between">
    <div className="flex items-start gap-2">
      <span className="pt-0.5">
        <img
          src={issuer.flag?.length ? issuer.flag : undefined}
          className="h-4 w-6"
          alt={`${issuer.name} flag`}
          loading="lazy"
        />
      </span>
      <span>{issuer.name}</span>
    </div>
    <span className="text-xs italic text-muted-foreground leading-5">
      ({issuer.start_year}-{issuer.end_year ?? "pres."})
    </span>
  </div>
);

export function IssuerField({ value, onChange, required }: IssuerFieldProps) {
  const [search, setSearch] = useState<string | null>(null);
  const { data } = useListIssuers({ search });

  const issuers = data?.items ?? [];
  // Flatten issuers: include both base issuers and their predecessors
  // This allows all items to be properly selectable and managed in state
  const flattenedIssuers = useMemo(() => {
    const flattened: (Issuer | Omit<Issuer, "predecessors">)[] = [];
    issuers.forEach((baseIssuer) => {
      flattened.push(baseIssuer);
      if (baseIssuer.predecessors) {
        flattened.push(...baseIssuer.predecessors);
      }
    });
    return flattened;
  }, [issuers]);

  // Ensure selected value persists in the items list
  // If value is selected but not in current search results, add it
  const itemsWithSelectedValue = useMemo(() => {
    if (!value) return flattenedIssuers;

    const valueExists = flattenedIssuers.some((item) => item.id === value.id);
    if (valueExists) return flattenedIssuers;

    // Value exists but not in current search results - add it to preserve selection
    return [...flattenedIssuers, value];
  }, [flattenedIssuers, value]);

  return (
    <Combobox
      aria-required={required}
      items={itemsWithSelectedValue}
      value={value}
      onValueChange={onChange}
      onInputValueChange={(inputValue) => setSearch(inputValue)}
      required={required}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between font-normal px-3"
          >
            <ComboboxValue>
              {(item: Issuer) =>
                item ? (
                  <IssuerItemContent issuer={item} />
                ) : (
                  <span className="text-muted-foreground">
                    Issuing authority or state
                  </span>
                )
              }
            </ComboboxValue>
            <SearchIcon className="text-muted-foreground" />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput showTrigger={false} placeholder="Search issuer..." />
        <ComboboxList>
          {issuers.map((baseIssuer) => (
            <ComboboxGroup key={baseIssuer.id} className="overflow-hidden">
              <ComboboxItem value={baseIssuer} className="pl-4">
                <IssuerItemContent issuer={baseIssuer} />
              </ComboboxItem>
              {baseIssuer.predecessors?.map((pred) => (
                <ComboboxItem key={pred.id} value={pred} className="pl-6">
                  <IssuerItemContent issuer={pred} />
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
        <ComboboxEmpty>No issuers found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
