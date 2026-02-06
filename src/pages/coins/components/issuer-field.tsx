import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox.tsx";
import { useListIssuers } from "@/query/commands";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Issuer } from "@/query/types";

interface IssuerFieldProps {
  value: Issuer | null;
  setValue: Dispatch<SetStateAction<Issuer | null>>;
  required?: boolean | undefined;
}

export function IssuerField({ value, setValue, required }: IssuerFieldProps) {
  const { data } = useListIssuers();

  return (
    <Combobox
      items={data}
      value={value}
      onValueChange={setValue}
      itemToStringLabel={(item) => item?.name ?? ""}
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
                  <div className="flex items-center gap-2">
                    <img
                      src={item.flag.length ? item.flag : undefined}
                      className="h-4 w-6"
                      alt={`${item.name} flag`}
                      loading="lazy"
                    />
                    <span>{item.name}</span>
                  </div>
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
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              <div className="flex items-center gap-2">
                <img
                  src={item.flag.length ? item.flag : undefined}
                  className="h-4 w-6"
                  alt={`${item.name} flag`}
                  loading="lazy"
                />
                <span>{item.name}</span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>No issuers found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
