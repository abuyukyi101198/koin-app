import { useState } from "react";
import { useForm } from "@tanstack/react-form";
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
  Field,
  FieldLabel,
  FieldContent,
  FieldSeparator,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ImageUploadField } from "@/components/composite/image-upload.tsx";
import { useCreateCoin } from "@/query/commands/coins.ts";
import { CreateCoinRequest, Issuer } from "@/query/types";
import { IssuerField } from "@/pages/coins/components/issuer-field.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group.tsx";
import { MinusIcon, PlusIcon } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

interface AddCoinDialogForm {
  onSuccess: () => void | Promise<void>;
}

export function AddCoinDialog({ onSuccess }: AddCoinDialogForm) {
  const [isOpen, setIsOpen] = useState(false);
  const createCoinMutation = useCreateCoin();

  const form = useForm({
    defaultValues: {
      reverseImage: "",
      obverseImage: "",
      description: "",
      value: "",
      currency: "",
      year: "",
      issuer: null as Issuer | null,
      quantity: "1",
      saleValue: "",
      notes: "",
    },
    onSubmit: async ({ value }) => {
      // Validation
      if (
        !value.value ||
        !value.currency.trim() ||
        !value.year ||
        !value.issuer
      ) {
        alert("Please fill in all required fields");
        return;
      }

      const coinData: CreateCoinRequest = {
        value: parseFloat(value.value),
        currency: value.currency.trim(),
        year: parseInt(value.year),
        issuer_id: value.issuer?.id,
        description: value.description.trim(),
        obverse_image: value.obverseImage || undefined,
        reverse_image: value.reverseImage || undefined,
        quantity: value.quantity ? parseInt(value.quantity) : 1,
        sale_value: value.saleValue ? parseFloat(value.saleValue) : undefined,
        notes: value.notes.trim() || undefined,
      };

      try {
        createCoinMutation.mutate(coinData);
        form.reset();
        setIsOpen(false);
        await onSuccess();
      } catch (error) {
        console.error("Error creating coin:", error);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DialogTrigger asChild>
        <Button variant="outline">Add new coin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add coin to catalogue</DialogTitle>
          <DialogDescription>
            Add a new coin record to your collection catalogue.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldSet className="gap-2">
            <FieldLegend>Identification</FieldLegend>
            <FieldDescription>
              Identifying information of your coin like its face value, mint
              year, and issuing authority.
            </FieldDescription>
            <FieldGroup className="flex-row gap-4">
              <div className="flex flex-2 gap-0">
                <form.Field name="value">
                  {(field) => (
                    <Field orientation="vertical" className="flex-2 gap-1">
                      <FieldLabel htmlFor="value" className="gap-1">
                        Value
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          aria-required
                          className="[&::-webkit-inner-spin-button]:appearance-none rounded-r-none text-right"
                          id="value"
                          type="number"
                          step="0.01"
                          placeholder="e.g. 10.00"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                        />
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>
                <form.Field name="currency">
                  {(field) => (
                    <Field orientation="vertical" className="flex-1 gap-1">
                      <FieldLabel
                        htmlFor="currency"
                        className="justify-end gap-1"
                      >
                        Currency
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          aria-required
                          className="border-l-0 rounded-l-none text-right"
                          id="currency"
                          placeholder="e.g. Lira"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                        />
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>
              </div>
              <form.Field name="year">
                {(field) => (
                  <Field orientation="vertical" className="flex-1 gap-1">
                    <FieldLabel htmlFor="year" className="justify-end gap-1">
                      Year
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        aria-required
                        className="[&::-webkit-inner-spin-button]:appearance-none text-right"
                        id="year"
                        type="number"
                        min={0}
                        max={new Date().getFullYear()}
                        maxLength={4}
                        placeholder="e.g. 1999"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                      />
                    </FieldContent>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
            <form.Field name="issuer">
              {(field) => (
                <Field orientation="vertical" className="gap-1">
                  <FieldLabel htmlFor="issuer" className="gap-1">
                    Issuer
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <IssuerField
                      value={field.state.value}
                      onChange={field.handleChange}
                      required
                    />
                  </FieldContent>
                </Field>
              )}
            </form.Field>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="gap-2">
            <FieldLegend className="pt-2.5">Description</FieldLegend>
            <FieldDescription>
              Additional description in case you want distinguish your coin from
              others of its mintage such as condition or even personal history.
            </FieldDescription>
            <FieldGroup>
              <form.Field name="description">
                {(field) => (
                  <Field orientation="vertical" className="gap-1">
                    <FieldContent>
                      <Input
                        id="description"
                        placeholder="Condition, provenance, or personal remarks"
                        maxLength={100}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </FieldContent>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="gap-2">
            <FieldLegend className="pt-2.5">Images</FieldLegend>
            <FieldDescription>
              Photographs or scans of your coin.
            </FieldDescription>
            <FieldGroup className="flex-row gap-6">
              <form.Field name="reverseImage">
                {(field) => (
                  <Field orientation="vertical" className="flex-1 gap-1">
                    <FieldLabel>Reverse Image</FieldLabel>
                    <FieldContent>
                      <ImageUploadField
                        label="Reverse image"
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    </FieldContent>
                  </Field>
                )}
              </form.Field>
              <form.Field name="obverseImage">
                {(field) => (
                  <Field orientation="vertical" className="flex-1 gap-1">
                    <FieldLabel>Obverse Image</FieldLabel>
                    <FieldContent>
                      <ImageUploadField
                        label="Obverse image"
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    </FieldContent>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="gap-2">
            <FieldLegend className="pt-2.5">Inventory</FieldLegend>
            <FieldDescription>
              Number of coins you own of this mintage, and the estimated sale
              value of one.
            </FieldDescription>
            <FieldGroup className="flex-row gap-4">
              <form.Field name="quantity">
                {(field) => (
                  <Field orientation="vertical" className="flex-1 gap-1">
                    <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                    <FieldContent>
                      <ButtonGroup className="w-full">
                        <Button
                          aria-label="Decrease quantity"
                          variant="outline"
                          disabled={Number(field.state.value) <= 1}
                          onClick={() =>
                            field.handleChange(
                              (Number(field.state.value) - 1).toString()
                            )
                          }
                        >
                          <MinusIcon />
                        </Button>
                        <Input
                          className="[&::-webkit-inner-spin-button]:appearance-none text-center"
                          id="quantity"
                          type="number"
                          min="1"
                          max="100"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <Button
                          aria-label="Increase quantity"
                          variant="outline"
                          disabled={Number(field.state.value) >= 100}
                          onClick={() =>
                            field.handleChange(
                              (Number(field.state.value) + 1).toString()
                            )
                          }
                        >
                          <PlusIcon />
                        </Button>
                      </ButtonGroup>
                    </FieldContent>
                  </Field>
                )}
              </form.Field>
              <form.Field name="saleValue">
                {(field) => (
                  <Field orientation="vertical" className="flex-1 gap-1">
                    <FieldLabel htmlFor="saleValue" className="justify-end">
                      Est. sale value
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>$</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          className="[&::-webkit-inner-spin-button]:appearance-none text-right"
                          id="saleValue"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>USD</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </FieldContent>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="gap-2">
            <FieldLegend className="pt-2.5">Notes</FieldLegend>
            <FieldDescription>
              Additional notes you want to add to your coin.
            </FieldDescription>
            <FieldGroup>
              <form.Field name="notes">
                {(field) => (
                  <Field orientation="vertical">
                    <FieldContent>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </FieldContent>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <DialogFooter className="pt-2.5">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={createCoinMutation.isPending}>
              {createCoinMutation.isPending ? "Saving..." : "Save Coin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
