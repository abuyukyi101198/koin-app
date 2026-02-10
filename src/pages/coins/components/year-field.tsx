import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { FormikProps } from "formik";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input";

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
    <Field orientation="vertical" className="flex-1 gap-1">
      <FieldLabel htmlFor="year" className="justify-end gap-1">
        Year
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-required
          aria-invalid={!!(error && touched)}
          aria-describedby={error && touched ? "year-error" : undefined}
          className="[&::-webkit-inner-spin-button]:appearance-none text-right"
          id="year"
          placeholder="e.g. 1999"
          autoComplete="off"
          autoCapitalize="off"
          value={value}
          onChange={async (e) => validateInputOnChange(e.target.value)}
        />
      </FieldContent>
    </Field>
  );
}
