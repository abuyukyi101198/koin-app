import { Form, Formik, FormikProps } from "formik";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import { DialogClose, DialogFooter } from "@/components/ui/dialog.tsx";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field.tsx";
import { useToastFormErrors } from "@/hooks/use-toast-form-errors.tsx";
import { ColumnField } from "@/pages/notebooks/components/fields/column-field.tsx";
import { DescriptionField } from "@/pages/notebooks/components/fields/description-field.tsx";
import { PageField } from "@/pages/notebooks/components/fields/page-field.tsx";
import { RowField } from "@/pages/notebooks/components/fields/row-field.tsx";
import { TitleField } from "@/pages/notebooks/components/fields/title-field.tsx";
import {
  NotebookFormData,
  notebookFormSchema,
} from "@/pages/notebooks/schemas/notebook-form-schema.ts";

interface NotebookFormProps {
  initialValues: NotebookFormData;
  isOpen: boolean;
  onSubmit: (values: NotebookFormData) => Promise<void> | void;
  submitLabel: string;
}

export function NotebookForm({
  initialValues,
  isOpen,
  onSubmit,
  submitLabel,
}: NotebookFormProps) {
  const renderErrors = useToastFormErrors<NotebookFormData>();

  return (
    <Formik<NotebookFormData>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
      validateOnBlur
      validateOnChange
      validateOnMount
      validationSchema={notebookFormSchema}
    >
      {({
        values,
        errors,
        touched,
        dirty,
        setFieldValue,
        setFieldTouched,
        isValid,
      }: FormikProps<NotebookFormData>) => {
        renderErrors({ errors, touched, isOpen });
        return (
          <Form className="space-y-4 flex flex-col" noValidate>
            <FieldSet className="gap-2">
              <FieldLegend>Notebook</FieldLegend>
              <FieldDescription>
                Identifying and dimension information of your notebook like its
                title and dimensions.
              </FieldDescription>
              <div className="w-full flex flex-row gap-6">
                <FieldGroup>
                  <TitleField
                    error={errors.title}
                    setFieldTouched={setFieldTouched}
                    setFieldValue={setFieldValue}
                    touched={touched.title}
                    value={values.title}
                  />
                </FieldGroup>
                <FieldGroup className="w-full flex-row items-end gap-0">
                  <RowField
                    error={errors.rows_per_page}
                    setFieldTouched={setFieldTouched}
                    setFieldValue={setFieldValue}
                    touched={touched.rows_per_page}
                    value={values.rows_per_page}
                  />
                  <X className="text-muted-foreground size-4 mb-2" />
                  <ColumnField
                    error={errors.columns_per_page}
                    setFieldTouched={setFieldTouched}
                    setFieldValue={setFieldValue}
                    touched={touched.columns_per_page}
                    value={values.columns_per_page}
                  />
                  <X className="text-muted-foreground size-4 mb-2" />
                  <PageField
                    error={errors.number_of_pages}
                    setFieldTouched={setFieldTouched}
                    setFieldValue={setFieldValue}
                    touched={touched.number_of_pages}
                    value={values.number_of_pages}
                  />
                </FieldGroup>
              </div>
            </FieldSet>
            <FieldSet className="gap-2">
              <FieldLegend>Description</FieldLegend>
              <FieldDescription>
                Additional description in case you want distinguish your
                notebook with extra information.
              </FieldDescription>
              <FieldGroup>
                <DescriptionField
                  error={errors.description}
                  setFieldTouched={setFieldTouched}
                  setFieldValue={setFieldValue}
                  touched={touched.description}
                  value={values.description}
                />
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <DialogFooter className="pt-2.5">
              <DialogClose asChild>
                <Button className="cursor-pointer" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="cursor-pointer"
                disabled={!(isValid && dirty)}
                type="submit"
              >
                {submitLabel}
              </Button>
            </DialogFooter>
          </Form>
        );
      }}
    </Formik>
  );
}
