import { useState } from "react";
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
  const [reverseImage, setReverseImage] = useState<string>("");
  const [obverseImage, setObverseImage] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [issuer, setIssuer] = useState<Issuer | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [saleValue, setSaleValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const createCoinMutation = useCreateCoin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !value || !currency.trim() || !year || !issuer) {
      alert("Please fill in all required fields");
      return;
    }

    const coinData: CreateCoinRequest = {
      title: title.trim(),
      value: parseFloat(value),
      currency: currency.trim(),
      year: parseInt(year),
      issuer_id: issuer?.id,
      obverse_image: obverseImage || undefined,
      reverse_image: reverseImage || undefined,
      quantity: quantity ? parseInt(quantity) : 1,
      sale_value: saleValue ? parseFloat(saleValue) : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      createCoinMutation.mutate(coinData);

      // Reset form on success
      setTitle("");
      setValue("");
      setCurrency("");
      setYear("");
      setIssuer(null);
      setQuantity("1");
      setSaleValue("");
      setNotes("");
      setReverseImage("");
      setObverseImage("");
      setIsOpen(false);

      await onSuccess();
    } catch (error) {
      console.error("Error creating coin:", error);
    }
  };

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldSet className="gap-2">
            <FieldLegend>Identification</FieldLegend>
            <FieldDescription>
              Identifying information of your coin like its face value, mint
              year, and issuing authority.
            </FieldDescription>
            <FieldGroup className="flex-row gap-4">
              <div className="flex flex-2 gap-0">
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
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      required
                    />
                  </FieldContent>
                </Field>
                <Field orientation="vertical" className="flex-1 gap-1">
                  <FieldLabel htmlFor="currency" className="justify-end gap-1">
                    Currency
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      aria-required
                      className="border-l-0 rounded-l-none text-right"
                      id="currency"
                      placeholder="e.g. Lira"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      required
                    />
                  </FieldContent>
                </Field>
              </div>
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
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
            <Field orientation="vertical" className="gap-1">
              <FieldLabel htmlFor="issuer" className="gap-1">
                Issuer
                <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <IssuerField value={issuer} setValue={setIssuer} required />
              </FieldContent>
            </Field>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="gap-2">
            <FieldLegend className="pt-2.5">Description</FieldLegend>
            <FieldDescription>
              Additional description in case you want distinguish your coin from
              others of its mintage such as condition or even personal history.
            </FieldDescription>
            <FieldGroup>
              <Field orientation="vertical" className="gap-1">
                <FieldContent>
                  <Input
                    aria-required
                    id="title"
                    placeholder="Condition, provenance, or personal remarks"
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="gap-2">
            <FieldLegend className="pt-2.5">Images</FieldLegend>
            <FieldDescription>
              Photographs or scans of your coin.
            </FieldDescription>
            <FieldGroup className="flex-row gap-6">
              <Field orientation="vertical" className="flex-1 gap-1">
                <FieldLabel>Reverse Image</FieldLabel>
                <FieldContent>
                  <ImageUploadField
                    label="Reverse image"
                    value={reverseImage}
                    onChange={setReverseImage}
                  />
                </FieldContent>
              </Field>
              <Field orientation="vertical" className="flex-1 gap-1">
                <FieldLabel>Obverse Image</FieldLabel>
                <FieldContent>
                  <ImageUploadField
                    label="Obverse image"
                    value={obverseImage}
                    onChange={setObverseImage}
                  />
                </FieldContent>
              </Field>
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
              <Field orientation="vertical" className="flex-1 gap-1">
                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                <FieldContent>
                  <ButtonGroup className="w-full">
                    <Button
                      aria-label="Decrease quantity"
                      variant="outline"
                      disabled={Number(quantity) <= 1}
                      onClick={() =>
                        setQuantity((prevState) =>
                          (Number(prevState) - 1).toString()
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
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <Button
                      aria-label="Increase quantity"
                      variant="outline"
                      disabled={Number(quantity) >= 100}
                      onClick={() =>
                        setQuantity((prevState) =>
                          (Number(prevState) + 1).toString()
                        )
                      }
                    >
                      <PlusIcon />
                    </Button>
                  </ButtonGroup>
                </FieldContent>
              </Field>
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
                      value={saleValue}
                      onChange={(e) => setSaleValue(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>USD</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="gap-2">
            <FieldLegend className="pt-2.5">Notes</FieldLegend>
            <FieldDescription>
              Additional notes you want to add to your coin.
            </FieldDescription>
            <FieldGroup>
              <Field orientation="vertical">
                <FieldContent>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </FieldContent>
              </Field>
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
