import { FormikProps } from "formik";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { NotebookFormData } from "@/pages/notebooks/schemas/notebook-form-schema.ts";

interface RowFieldProps {
  value: NotebookFormData["rows_per_page"];
  touched: FormikProps<NotebookFormData>["touched"]["rows_per_page"];
  error: FormikProps<NotebookFormData>["errors"]["rows_per_page"];
  setFieldValue: FormikProps<NotebookFormData>["setFieldValue"];
  setFieldTouched: FormikProps<NotebookFormData>["setFieldTouched"];
}

export function RowField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: RowFieldProps) {
  const validateInputOnChange = async (value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    await setFieldValue("rows_per_page", value, true);
    await setFieldTouched("rows_per_page", true, false);
  };

  return (
    <Field className="flex-2 gap-1" orientation="vertical">
      <FieldLabel className="gap-1" htmlFor="rows_per_page">
        Rows
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-describedby={error && touched ? "rows-error" : undefined}
          aria-invalid={!!(error && touched)}
          aria-required
          autoCapitalize="off"
          autoComplete="off"
          className="[&::-webkit-inner-spin-button]:appearance-none text-right border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
          id="rows_per_page"
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="m"
          step="1"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
