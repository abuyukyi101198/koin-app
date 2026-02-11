import { FormikProps } from "formik";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";

interface CurrencyFieldProps {
  value: CoinFormData["currency"];
  touched: FormikProps<CoinFormData>["touched"]["currency"];
  error: FormikProps<CoinFormData>["errors"]["currency"];
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
}

export function CurrencyField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: CurrencyFieldProps) {
  const validateInputOnChange = async (value: string) => {
    await setFieldValue("currency", value, true);
    await setFieldTouched("currency", true, false);
  };

  return (
    <Field className="flex-1 gap-1" orientation="vertical">
      <FieldLabel className="justify-end gap-1" htmlFor="currency">
        Currency
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-describedby={error && touched ? "currency-error" : undefined}
          aria-invalid={!!(error && touched)}
          aria-required
          autoCapitalize="off"
          autoComplete="off"
          className="border-l-0 rounded-l-none text-right"
          id="currency"
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="e.g. Lira"
          required
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
