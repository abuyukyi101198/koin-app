import { useMemo, useState } from "react";

import { FormikProps } from "formik";
import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
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
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { useListIssuers } from "@/query/commands";
import { Issuer } from "@/query/types";

interface IssuerFieldProps {
  value: CoinFormData["issuer"];
  touched: FormikProps<CoinFormData>["touched"]["issuer"];
  error: FormikProps<CoinFormData>["errors"]["issuer"];
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
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
          alt={`${issuer.name} flag`}
          className="h-4 w-6"
          loading="lazy"
          src={issuer.flag?.length ? issuer.flag : undefined}
        />
      </span>
      <span>{issuer.name}</span>
    </div>
    <span className="text-xs italic text-muted-foreground leading-5">
      ({issuer.start_year}-{issuer.end_year ?? "pres."})
    </span>
  </div>
);

export function IssuerField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: IssuerFieldProps) {
  const [search, setSearch] = useState<string | null>(null);
  const { data } = useListIssuers({ search });

  // Flatten issuers: include both base issuers and their predecessors
  // This allows all items to be properly selectable and managed in state
  const flattenedIssuers = useMemo(() => {
    const flattened: (Issuer | Omit<Issuer, "predecessors">)[] = [];
    data?.items.forEach((baseIssuer) => {
      flattened.push(baseIssuer);
      if (baseIssuer.predecessors) {
        flattened.push(...baseIssuer.predecessors);
      }
    });
    return flattened;
  }, [data?.items]);

  // Ensure selected value persists in the items list
  // If value is selected but not in current search results, add it
  const itemsWithSelectedValue = useMemo(() => {
    if (!value) return flattenedIssuers;

    const valueExists = flattenedIssuers.some((item) => item.id === value.id);
    if (valueExists) return flattenedIssuers;

    // Value exists but not in current search results - add it to preserve selection
    return [...flattenedIssuers, value];
  }, [flattenedIssuers, value]);

  const validateInputOnChange = async (value: Issuer | null) => {
    await setFieldValue("issuer", value, true);
    await setFieldTouched("issuer", true, false);
  };

  return (
    <Field className="gap-1" orientation="vertical">
      <FieldLabel className="gap-1" htmlFor="issuer">
        Issuer
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Combobox<Issuer>
          aria-describedby={error && touched ? "value-error" : undefined}
          aria-invalid={!!(error && touched)}
          aria-required
          items={itemsWithSelectedValue}
          onInputValueChange={(inputValue) => {
            setSearch(inputValue);
          }}
          onValueChange={(value) => validateInputOnChange(value)}
          required
          value={value}
        >
          <ComboboxTrigger
            render={
              <Button
                aria-invalid={!!(error && touched)}
                className="w-full justify-between font-normal px-3"
                variant="outline"
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
            <ComboboxInput placeholder="Search issuer..." showTrigger={false} />
            <ComboboxList>
              {data?.items.map((baseIssuer) => (
                <ComboboxGroup className="overflow-hidden" key={baseIssuer.id}>
                  <ComboboxItem className="pl-4" value={baseIssuer}>
                    <IssuerItemContent issuer={baseIssuer} />
                  </ComboboxItem>
                  {baseIssuer.predecessors?.map((pred) => (
                    <ComboboxItem className="pl-6" key={pred.id} value={pred}>
                      <IssuerItemContent issuer={pred} />
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              ))}
            </ComboboxList>
            <ComboboxEmpty>No issuers found.</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </FieldContent>
    </Field>
  );
}
