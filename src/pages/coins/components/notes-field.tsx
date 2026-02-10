import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { FormikProps } from "formik";
import { Field, FieldContent } from "@/components/ui/field.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

interface NotesFieldProps {
  value: CoinFormData["notes"];
  touched: FormikProps<CoinFormData>["touched"]["notes"];
  error: FormikProps<CoinFormData>["errors"]["notes"];
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
}

export function NotesField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: NotesFieldProps) {
  const validateInputOnChange = async (value: string) => {
    await setFieldValue("notes", value, true);
    await setFieldTouched("notes", true, false);
  };

  return (
    <Field orientation="vertical">
      <FieldContent>
        <Textarea
          aria-invalid={touched && !!error}
          aria-describedby={touched && error ? "notes-error" : undefined}
          id="notes"
          placeholder="Additional notes"
          autoComplete="off"
          autoCapitalize="off"
          value={value}
          onChange={async (e) => validateInputOnChange(e.target.value)}
        />
      </FieldContent>
    </Field>
  );
}
