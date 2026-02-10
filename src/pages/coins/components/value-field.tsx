import { FormikProps } from "formik";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";

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
    <Field orientation="vertical" className="flex-2 gap-1">
      <FieldLabel htmlFor="value" className="gap-1">
        Value
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-required
          aria-invalid={!!(error && touched)}
          aria-describedby={error && touched ? "value-error" : undefined}
          className="[&::-webkit-inner-spin-button]:appearance-none rounded-r-none text-right"
          id="value"
          step="0.01"
          placeholder="e.g. 10.00"
          autoComplete="off"
          autoCapitalize="off"
          value={value}
          onChange={async (e) => validateInputOnChange(e.target.value)}
        />
      </FieldContent>
    </Field>
  );
}
