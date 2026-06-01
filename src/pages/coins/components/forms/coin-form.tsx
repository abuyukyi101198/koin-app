import { Form, Formik, FormikProps } from "formik";

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
import { CurrencyField } from "@/pages/coins/components/fields/currency-field.tsx";
import { DescriptionField } from "@/pages/coins/components/fields/description-field.tsx";
import { ImagesField } from "@/pages/coins/components/fields/images-field.tsx";
import { IssuerField } from "@/pages/coins/components/fields/issuer-field.tsx";
import { NotesField } from "@/pages/coins/components/fields/notes-field.tsx";
import { QuantityField } from "@/pages/coins/components/fields/quantity-field.tsx";
import { SaleValueField } from "@/pages/coins/components/fields/sale-value-field.tsx";
import { ValueField } from "@/pages/coins/components/fields/value-field.tsx";
import { YearField } from "@/pages/coins/components/fields/year-field.tsx";
import {
  CoinFormData,
  coinFormSchema,
} from "@/pages/coins/schemas/coin-form-schema.ts";

interface CoinFormProps {
  initialValues: CoinFormData;
  isOpen: boolean;
  onSubmit: (values: CoinFormData) => Promise<void> | void;
  submitLabel: string;
}

export function CoinForm({
  initialValues,
  isOpen,
  onSubmit,
  submitLabel,
}: CoinFormProps) {
  const renderErrors = useToastFormErrors<CoinFormData>();

  return (
    <Formik<CoinFormData>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
      validateOnBlur
      validateOnChange
      validateOnMount
      validationSchema={coinFormSchema}
    >
      {({
        values,
        errors,
        touched,
        dirty,
        setFieldValue,
        setFieldTouched,
        isValid,
      }: FormikProps<CoinFormData>) => {
        renderErrors({ errors, touched, isOpen });
        return (
          <Form className="space-y-4 flex flex-col" noValidate>
            <div className="grid grid-cols-3 gap-12 flex-1">
              {/* Left Column */}
              <div className="space-y-4">
                <FieldSet className="gap-2">
                  <FieldLegend className="font-serif text-lg!">
                    Images
                  </FieldLegend>
                  <FieldDescription>
                    Photographs or scans of your coin.
                  </FieldDescription>
                  <FieldGroup className="gap-3">
                    <ImagesField
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      value={{
                        reverseImage: values.reverseImage,
                        obverseImage: values.obverseImage,
                      }}
                    />
                  </FieldGroup>
                </FieldSet>
              </div>
              {/* Right Column */}
              <div className="flex flex-col col-span-2 space-y-4">
                <FieldSet className="gap-2">
                  <FieldLegend className="font-serif text-lg!">
                    Identification
                  </FieldLegend>
                  <FieldDescription>
                    Identifying information of your coin like its face value,
                    mint year, and issuing authority.
                  </FieldDescription>
                  <FieldGroup className="flex-row gap-4">
                    <div className="flex flex-2 gap-0">
                      <ValueField
                        error={errors.value}
                        setFieldTouched={setFieldTouched}
                        setFieldValue={setFieldValue}
                        touched={touched.value}
                        value={values.value}
                      />
                      <CurrencyField
                        error={errors.currency}
                        setFieldTouched={setFieldTouched}
                        setFieldValue={setFieldValue}
                        touched={touched.currency}
                        value={values.currency}
                      />
                    </div>
                    <YearField
                      error={errors.year}
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      touched={touched.year}
                      value={values.year}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <IssuerField
                      error={errors.issuer}
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      touched={touched.issuer}
                      value={values.issuer}
                    />
                  </FieldGroup>
                </FieldSet>

                <FieldSet className="gap-2">
                  <FieldLegend className="font-serif text-lg!">
                    Description
                  </FieldLegend>
                  <FieldDescription>
                    Additional description in case you want distinguish your
                    coin from others of its mintage such as condition or even
                    personal history.
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

                <FieldSet className="gap-2">
                  <FieldLegend className="font-serif text-lg!">
                    Inventory
                  </FieldLegend>
                  <FieldDescription>
                    Number of coins you own of this mintage, and the estimated
                    sale value of one.
                  </FieldDescription>
                  <FieldGroup className="flex-row gap-4">
                    <QuantityField
                      error={errors.quantity}
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      touched={touched.quantity}
                      value={values.quantity}
                    />
                    <SaleValueField
                      error={errors.saleValue}
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      touched={touched.saleValue}
                      value={values.saleValue}
                    />
                  </FieldGroup>
                </FieldSet>

                <FieldSet className="gap-2 flex flex-col flex-1">
                  <FieldLegend className="font-serif text-lg!">
                    Notes
                  </FieldLegend>
                  <FieldDescription>
                    Additional notes you want to add to your coin.
                  </FieldDescription>
                  <FieldGroup className="flex-1 flex flex-col">
                    <NotesField
                      error={errors.notes}
                      setFieldTouched={setFieldTouched}
                      setFieldValue={setFieldValue}
                      touched={touched.notes}
                      value={values.notes}
                    />
                  </FieldGroup>
                </FieldSet>
              </div>
            </div>
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
