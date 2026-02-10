import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { FormikProps } from "formik";
import { Field, FieldContent } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input";

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
    <Field orientation="vertical" className="gap-1">
      <FieldContent>
        <Input
          aria-invalid={touched && !!error}
          aria-describedby={touched && error ? "description-error" : undefined}
          id="description"
          placeholder="Condition, provenance, or personal remarks"
          maxLength={100}
          autoComplete="off"
          autoCapitalize="off"
          value={value}
          onChange={async (e) => validateInputOnChange(e.target.value)}
        />
      </FieldContent>
    </Field>
  );
}
