import { FormikProps } from "formik";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { NotebookFormData } from "@/pages/notebooks/schemas/notebook-form-schema.ts";

interface PageFieldProps {
  value: NotebookFormData["number_of_pages"];
  touched: FormikProps<NotebookFormData>["touched"]["number_of_pages"];
  error: FormikProps<NotebookFormData>["errors"]["number_of_pages"];
  setFieldValue: FormikProps<NotebookFormData>["setFieldValue"];
  setFieldTouched: FormikProps<NotebookFormData>["setFieldTouched"];
}

export function PageField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: PageFieldProps) {
  const validateInputOnChange = async (value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    await setFieldValue("number_of_pages", value, true);
    await setFieldTouched("number_of_pages", true, false);
  };

  return (
    <Field className="flex-2 gap-1" orientation="vertical">
      <FieldLabel className="gap-1" htmlFor="number_of_pages">
        Pages
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-describedby={error && touched ? "pages-error" : undefined}
          aria-invalid={!!(error && touched)}
          aria-required
          autoCapitalize="off"
          autoComplete="off"
          className="[&::-webkit-inner-spin-button]:appearance-none text-right border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
          id="number_of_pages"
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="1"
          step="1"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
