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
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Issuer } from "@/query/types";

interface IssuerFieldProps {
  value: Issuer | null;
  setValue: Dispatch<SetStateAction<Issuer | null>>;
  required?: boolean | undefined;
}

// Helper to render issuer item with flag
const IssuerItemContent = ({ issuer }: { issuer: Issuer }) => (
  <div className="flex items-center gap-2">
    <img
      src={issuer.flag?.length ? issuer.flag : undefined}
      className="h-4 w-6"
      alt={`${issuer.name} flag`}
      loading="lazy"
    />
    <span>{issuer.name}</span>
  </div>
);

export function IssuerField({ value, setValue, required }: IssuerFieldProps) {
  const [search, setSearch] = useState<string | null>(null);
  const { data } = useListIssuers({ search });

  console.log(data);
  const issuers = data?.items ?? [];
  // Flatten issuers: include both base issuers and their predecessors
  // This allows all items to be properly selectable and managed in state
  const flattenedIssuers = useMemo(() => {
    const flattened: Issuer[] = [];
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
      items={itemsWithSelectedValue}
      value={value}
      onValueChange={setValue}
      onInputValueChange={(inputValue) => setSearch(inputValue)}
      required={required}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className="w-64 justify-between font-normal"
          >
            <ComboboxValue>
              {(item: Issuer) =>
                item ? (
                  <IssuerItemContent issuer={item} />
                ) : (
                  <span className="text-muted-foreground">Select issuer</span>
                )
              }
            </ComboboxValue>
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput showTrigger={false} placeholder="Search issuer..." />
        <ComboboxList>
          {issuers.map((baseIssuer) => (
            <ComboboxGroup key={baseIssuer.id} className="overflow-hidden">
              <ComboboxItem value={baseIssuer}>
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
