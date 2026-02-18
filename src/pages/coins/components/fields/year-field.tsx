import { FormikProps } from "formik";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";

interface YearFieldProps {
  value: CoinFormData["year"];
  touched: FormikProps<CoinFormData>["touched"]["year"];
  error: FormikProps<CoinFormData>["errors"]["year"];
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
}

export function YearField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: YearFieldProps) {
  const validateInputOnChange = async (value: string) => {
    if (!/^[0-9]{0,4}$/.test(value)) return;
    await setFieldValue("year", value, true);
    await setFieldTouched("year", true, false);
  };

  return (
    <Field className="flex-1 gap-1" orientation="vertical">
      <FieldLabel className="justify-end gap-1" htmlFor="year">
        Year
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-describedby={error && touched ? "year-error" : undefined}
          aria-invalid={!!(error && touched)}
          aria-required
          autoCapitalize="off"
          autoComplete="off"
          className="[&::-webkit-inner-spin-button]:appearance-none text-right border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
          id="year"
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="e.g. 1999"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
