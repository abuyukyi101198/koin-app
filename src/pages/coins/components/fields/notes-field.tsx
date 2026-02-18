import { FormikProps } from "formik";

import { Field, FieldContent } from "@/components/ui/field.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";

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
    <Field className="h-full flex flex-col" orientation="vertical">
      <FieldContent className="flex-1 flex">
        <Textarea
          aria-describedby={touched && error ? "notes-error" : undefined}
          aria-invalid={touched && !!error}
          autoCapitalize="off"
          autoComplete="off"
          className="flex-1 resize-none border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
          id="notes"
          maxLength={1000}
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="Additional notes"
          spellCheck="true"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
