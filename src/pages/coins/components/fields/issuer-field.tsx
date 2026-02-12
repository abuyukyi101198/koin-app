import { useMemo } from "react";

import { FormikProps } from "formik";
import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
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
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { cn } from "@/lib/utils.ts";
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
);

export function IssuerField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: IssuerFieldProps) {
  const { data } = useListIssuers();

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

  const filterIssuers = (itemValue: Issuer, query: string) => {
    return (
      itemValue.name.toLowerCase().includes(query.toLowerCase()) ||
      (value && itemValue.id === value.id) ||
      ("predecessors" in itemValue &&
        itemValue.predecessors &&
        itemValue.predecessors.some(
          (pred) =>
            pred.name.toLowerCase().includes(query.toLowerCase()) ||
            (value && pred.id === value.id)
        ))
    );
  };

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
          filter={filterIssuers}
          items={flattenedIssuers}
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
              {(item) => (
                <ComboboxItem
                  className={cn("cursor-pointer", {
                    "pl-4":
                      "predecessors" in item && item.predecessors !== null,
                    "pl-6":
                      "predecessors" in item && item.predecessors === null,
                  })}
                  key={item.id}
                  value={item}
                >
                  <IssuerItemContent issuer={item} />
                </ComboboxItem>
              )}
            </ComboboxList>
            <ComboboxEmpty>No issuers found.</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </FieldContent>
    </Field>
  );
}
