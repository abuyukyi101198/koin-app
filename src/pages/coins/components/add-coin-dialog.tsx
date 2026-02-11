import { useState } from "react";

import { Formik, Form } from "formik";

import { Button } from "@/components/ui/button.tsx";
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
import {
  FieldGroup,
  FieldSeparator,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field.tsx";
import { CurrencyField } from "@/pages/coins/components/currency-field.tsx";
import { DescriptionField } from "@/pages/coins/components/description-field.tsx";
import { ImagesField } from "@/pages/coins/components/images-field.tsx";
import { IssuerField } from "@/pages/coins/components/issuer-field.tsx";
import { NotesField } from "@/pages/coins/components/notes-field.tsx";
import { QuantityField } from "@/pages/coins/components/quantity-field.tsx";
import { SaleValueField } from "@/pages/coins/components/sale-value-field.tsx";
import {
  CoinFormData,
  coinFormSchema,
} from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { ValueField } from "@/pages/coins/components/value-field.tsx";
import { YearField } from "@/pages/coins/components/year-field.tsx";
import { useCreateCoin } from "@/query/commands/coins.ts";
import { CreateCoinRequest } from "@/query/types";

interface AddCoinDialogForm {
  onSuccess: () => Promise<void> | void;
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
    <>
      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}
      <Dialog modal={false} onOpenChange={setIsOpen} open={isOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add new coin</Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-4xl p-8 z-50"
          showCloseButton={false}
        >
          <DialogHeader className="hidden">
            <DialogTitle>Add coin to catalogue</DialogTitle>
            <DialogDescription>
              Add a new coin record to your collection catalogue.
            </DialogDescription>
          </DialogHeader>
          <Formik<CoinFormData>
            enableReinitialize
            initialValues={initialValues}
            onSubmit={handleSubmit}
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
                      <FieldLegend>Identification</FieldLegend>
                      <FieldDescription>
                        Identifying information of your coin like its face
                        value, mint year, and issuing authority.
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
                      <FieldLegend>Description</FieldLegend>
                      <FieldDescription>
                        Additional description in case you want distinguish your
                        coin from others of its mintage such as condition or
                        even personal history.
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
                      <FieldLegend>Inventory</FieldLegend>
                      <FieldDescription>
                        Number of coins you own of this mintage, and the
                        estimated sale value of one.
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
                      <FieldLegend>Notes</FieldLegend>
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
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    disabled={
                      createCoinMutation.isPending || !(isValid && dirty)
                    }
                    type="submit"
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
    </>
  );
}
