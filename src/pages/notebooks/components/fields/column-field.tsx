import { FormikProps } from "formik";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { NotebookFormData } from "@/pages/notebooks/schemas/notebook-form-schema.ts";

interface ColumnFieldProps {
  value: NotebookFormData["columns_per_page"];
  touched: FormikProps<NotebookFormData>["touched"]["columns_per_page"];
  error: FormikProps<NotebookFormData>["errors"]["columns_per_page"];
  setFieldValue: FormikProps<NotebookFormData>["setFieldValue"];
  setFieldTouched: FormikProps<NotebookFormData>["setFieldTouched"];
}

export function ColumnField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: ColumnFieldProps) {
  const validateInputOnChange = async (value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    await setFieldValue("columns_per_page", value, true);
    await setFieldTouched("columns_per_page", true, false);
  };

  return (
    <Field className="flex-2 gap-1" orientation="vertical">
      <FieldLabel className="gap-1" htmlFor="columns_per_page">
        Columns
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-describedby={error && touched ? "columns-error" : undefined}
          aria-invalid={!!(error && touched)}
          aria-required
          autoCapitalize="off"
          autoComplete="off"
          className="[&::-webkit-inner-spin-button]:appearance-none text-right border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
          id="columns_per_page"
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="n"
          step="1"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
