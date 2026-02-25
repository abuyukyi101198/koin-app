import { FormikProps } from "formik";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { NotebookFormData } from "@/pages/notebooks/schemas/notebook-form-schema.ts";

interface TitleFieldProps {
  value: NotebookFormData["title"];
  touched: FormikProps<NotebookFormData>["touched"]["title"];
  error: FormikProps<NotebookFormData>["errors"]["title"];
  setFieldValue: FormikProps<NotebookFormData>["setFieldValue"];
  setFieldTouched: FormikProps<NotebookFormData>["setFieldTouched"];
}

export function TitleField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: TitleFieldProps) {
  const validateInputOnChange = async (value: string) => {
    await setFieldValue("title", value, true);
    await setFieldTouched("title", true, false);
  };

  return (
    <Field className="gap-1" orientation="vertical">
      <FieldLabel className="gap-1" htmlFor="title">
        Title
        <span className="text-destructive">*</span>
      </FieldLabel>
      <FieldContent>
        <Input
          aria-describedby={touched && error ? "title-error" : undefined}
          aria-invalid={touched && !!error}
          autoCapitalize="off"
          autoComplete="off"
          className="border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
          id="title"
          maxLength={100}
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="Distinct notebook title"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
