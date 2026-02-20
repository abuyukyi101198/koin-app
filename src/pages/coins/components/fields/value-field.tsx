import { FormikProps } from "formik";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CoinFormData } from "@/pages/coins/schemas/coin-form-schema.ts";

interface ValueFieldProps {
  value: CoinFormData["value"];
  touched: FormikProps<CoinFormData>["touched"]["value"];
  error: FormikProps<CoinFormData>["errors"]["value"];
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
}

export function ValueField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: ValueFieldProps) {
  const validateInputOnChange = async (value: string) => {
    if (!/^[0-9]*\.?[0-9]{0,2}$/.test(value)) return;
    await setFieldValue("value", value, true);
    await setFieldTouched("value", true, false);
  };

  return (
    <Field className="flex-2 gap-1" orientation="vertical">
      <FieldLabel className="gap-1" htmlFor="value">
        Value
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-describedby={error && touched ? "value-error" : undefined}
          aria-invalid={!!(error && touched)}
          aria-required
          autoCapitalize="off"
          autoComplete="off"
          className="[&::-webkit-inner-spin-button]:appearance-none text-right border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
          id="value"
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="e.g. 10.00"
          step="0.01"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
