import { FormikProps } from "formik";

import { Field, FieldContent } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { NotebookFormData } from "@/pages/notebooks/schemas/notebook-form-schema.ts";

interface DescriptionFieldProps {
  value: NotebookFormData["description"];
  touched: FormikProps<NotebookFormData>["touched"]["description"];
  error: FormikProps<NotebookFormData>["errors"]["description"];
  setFieldValue: FormikProps<NotebookFormData>["setFieldValue"];
  setFieldTouched: FormikProps<NotebookFormData>["setFieldTouched"];
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
          className="border-l-0 border-t-0 border-r-0 rounded-none bg-background! focus-visible:ring-0"
          id="description"
          maxLength={100}
          onChange={async (e) => validateInputOnChange(e.target.value)}
          placeholder="Notebook description"
          value={value}
        />
      </FieldContent>
    </Field>
  );
}
