import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { FormikProps } from "formik";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";

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
    <Field orientation="vertical" className="flex-1 gap-1">
      <FieldLabel htmlFor="currency" className="justify-end gap-1">
        Currency
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-required
          aria-invalid={!!(error && touched)}
          aria-describedby={error && touched ? "currency-error" : undefined}
          className="border-l-0 rounded-l-none text-right"
          id="currency"
          placeholder="e.g. Lira"
          autoComplete="off"
          autoCapitalize="off"
          value={value}
          onChange={async (e) => validateInputOnChange(e.target.value)}
          required
        />
      </FieldContent>
    </Field>
  );
}
