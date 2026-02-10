import { useState } from "react";
import { Formik, Form } from "formik";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  FieldGroup,
  FieldSeparator,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field.tsx";
import { useCreateCoin } from "@/query/commands/coins.ts";
import { CreateCoinRequest } from "@/query/types";
import { IssuerField } from "@/pages/coins/components/issuer-field.tsx";
import {
  CoinFormData,
  coinFormSchema,
} from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { ValueField } from "@/pages/coins/components/value-field.tsx";
import { CurrencyField } from "@/pages/coins/components/currency-field.tsx";
import { YearField } from "@/pages/coins/components/year-field.tsx";
import { ImagesField } from "@/pages/coins/components/images-field.tsx";
import { DescriptionField } from "@/pages/coins/components/description-field.tsx";
import { QuantityField } from "@/pages/coins/components/quantity-field.tsx";
import { SaleValueField } from "@/pages/coins/components/sale-value-field.tsx";
import { NotesField } from "@/pages/coins/components/notes-field.tsx";

interface AddCoinDialogForm {
  onSuccess: () => void | Promise<void>;
}

export function AddCoinDialog({ onSuccess }: AddCoinDialogForm) {
  const [isOpen, setIsOpen] = useState(false);
  const createCoinMutation = useCreateCoin();

  const initialValues = {
    reverseImage: "",
    obverseImage: "",
    description: "",
    value: "",
    currency: "",
    year: "",
    issuer: null as any,
    quantity: "1",
    saleValue: "",
    notes: "",
  };

  const handleSubmit = async (values: CoinFormData) => {
    try {
      const coinData: CreateCoinRequest = {
        value: parseFloat(values.value ?? "0"),
        currency: (values.currency ?? "").trim(),
        year: parseInt(values.year ?? "0", 10),
        issuer_id: values.issuer!.id,
        description: (values.description ?? "").trim() || undefined,
        obverse_image: values.obverseImage || undefined,
        reverse_image: values.reverseImage || undefined,
        quantity: parseInt(values.quantity ?? "0", 10),
        sale_value: values.saleValue ? parseFloat(values.saleValue) : undefined,
        notes: (values.notes ?? "").trim() || undefined,
      };

      createCoinMutation.mutate(coinData);
      setIsOpen(false);
      await onSuccess();
    } catch (error) {
      console.error("Validation or submission error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DialogTrigger asChild>
        <Button variant="outline">Add new coin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-8" showCloseButton={false}>
        <DialogHeader className="hidden">
          <DialogTitle>Add coin to catalogue</DialogTitle>
          <DialogDescription>
            Add a new coin record to your collection catalogue.
          </DialogDescription>
        </DialogHeader>
        <Formik<CoinFormData>
          initialValues={initialValues}
          validationSchema={coinFormSchema}
          onSubmit={handleSubmit}
          validateOnChange
          validateOnBlur
          validateOnMount
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            dirty,
            setFieldValue,
            setFieldTouched,
            isValid,
          }) => (
            <Form className="space-y-4 flex flex-col" noValidate>
              <div className="grid grid-cols-3 gap-12 flex-1">
                {/* Left Column */}
                <div className="space-y-4">
                  <FieldSet className="gap-2">
                    <FieldLegend>Images</FieldLegend>
                    <FieldDescription>
                      Photographs or scans of your coin.
                    </FieldDescription>
                    <FieldGroup className="gap-3">
                      <ImagesField
                        value={{
                          reverseImage: values.reverseImage,
                          obverseImage: values.obverseImage,
                        }}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                      />
                    </FieldGroup>
                  </FieldSet>
                </div>
                {/* Right Column */}
                <div className="flex flex-col col-span-2 space-y-4">
                  <FieldSet className="gap-2">
                    <FieldLegend>Identification</FieldLegend>
                    <FieldDescription>
                      Identifying information of your coin like its face value,
                      mint year, and issuing authority.
                    </FieldDescription>
                    <FieldGroup className="flex-row gap-4">
                      <div className="flex flex-2 gap-0">
                        <ValueField
                          value={values.value}
                          touched={touched.value}
                          error={errors.value}
                          setFieldValue={setFieldValue}
                          setFieldTouched={setFieldTouched}
                        />
                        <CurrencyField
                          value={values.currency}
                          touched={touched.currency}
                          error={errors.currency}
                          setFieldValue={setFieldValue}
                          setFieldTouched={setFieldTouched}
                        />
                      </div>
                      <YearField
                        value={values.year}
                        touched={touched.year}
                        error={errors.year}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <IssuerField
                        value={values.issuer}
                        touched={touched.issuer}
                        error={errors.issuer}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="gap-2">
                    <FieldLegend>Description</FieldLegend>
                    <FieldDescription>
                      Additional description in case you want distinguish your
                      coin from others of its mintage such as condition or even
                      personal history.
                    </FieldDescription>
                    <FieldGroup>
                      <DescriptionField
                        value={values.description}
                        touched={touched.description}
                        error={errors.description}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="gap-2">
                    <FieldLegend>Inventory</FieldLegend>
                    <FieldDescription>
                      Number of coins you own of this mintage, and the estimated
                      sale value of one.
                    </FieldDescription>
                    <FieldGroup className="flex-row gap-4">
                      <QuantityField
                        value={values.quantity}
                        touched={touched.quantity}
                        error={errors.quantity}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                      />
                      <SaleValueField
                        value={values.saleValue}
                        touched={touched.saleValue}
                        error={errors.saleValue}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="gap-2 flex flex-col flex-1">
                    <FieldLegend>Notes</FieldLegend>
                    <FieldDescription>
                      Additional notes you want to add to your coin.
                    </FieldDescription>
                    <FieldGroup className="flex-1 flex flex-col">
                      <NotesField
                        value={values.notes}
                        touched={touched.notes}
                        error={errors.notes}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                      />
                    </FieldGroup>
                  </FieldSet>
                </div>
              </div>
              <FieldSeparator />
              <DialogFooter className="pt-2.5">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={createCoinMutation.isPending || !(isValid && dirty)}
                >
                  {createCoinMutation.isPending
                    ? "Saving..."
                    : "Save to catalogue"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
