import { FormikProps } from "formik";

import { Field, FieldContent } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";

interface DescriptionFieldProps {
  value: CoinFormData["description"];
  touched: FormikProps<CoinFormData>["touched"]["description"];
  error: FormikProps<CoinFormData>["errors"]["description"];
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
}

export function DescriptionField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: DescriptionFieldProps) {
  const validateInputOnChange = async (value: string) => {
    await setFieldValue("description", value, true);
    await setFieldTouched("description", true, false);
  };

  return (
    <Field className="gap-1" orientation="vertical">
      <FieldContent>
        <Input
          aria-describedby={touched && error ? "description-error" : undefined}
          aria-invalid={touched && !!error}
          autoCapitalize="off"
          autoComplete="off"
          id="description"
          maxLength={100}
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="Condition, provenance, or personal remarks"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
