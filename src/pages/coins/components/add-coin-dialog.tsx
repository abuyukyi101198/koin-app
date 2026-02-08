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
} from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ImageUploadField } from "@/components/composite/image-upload.tsx";
import { useCreateCoin } from "@/query/commands/coins.ts";
import { CreateCoinRequest, Issuer } from "@/query/types";
import { IssuerField } from "@/pages/coins/components/issuer-field.tsx";

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
        <Button variant="outline">Add Coin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-8" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>New coin</DialogTitle>
          <DialogDescription>
            Add a new coin record to your collection catalogue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup className="flex-row gap-4">
            <div className="flex flex-2 gap-0">
              <Field orientation="vertical" className="flex-2 gap-1">
                <FieldLabel htmlFor="value" className="gap-1">
                  Value
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    className="[&::-webkit-inner-spin-button]:appearance-none rounded-r-none text-right"
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
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
                    className="border-l-0 rounded-l-none text-right"
                    id="currency"
                    placeholder="Lira"
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
                  className="[&::-webkit-inner-spin-button]:appearance-none text-right"
                  id="year"
                  type="number"
                  placeholder="YYYY"
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
          <FieldGroup>
            <Field orientation="vertical" className="gap-1">
              <FieldLabel htmlFor="title">Description</FieldLabel>
              <FieldContent>
                <Input
                  id="title"
                  placeholder="Optional"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup className="flex-row gap-6 pt-2.5">
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
          <FieldSeparator />
          <FieldGroup className="flex-row gap-4 pt-2.5">
            <Field orientation="vertical" className="flex-1">
              <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
              <FieldContent>
                <Input
                  className="[&::-webkit-inner-spin-button]:appearance-none"
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </FieldContent>
            </Field>
            <Field orientation="vertical" className="flex-1">
              <FieldLabel htmlFor="saleValue">Sale Value</FieldLabel>
              <FieldContent>
                <Input
                  className="[&::-webkit-inner-spin-button]:appearance-none"
                  id="saleValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={saleValue}
                  onChange={(e) => setSaleValue(e.target.value)}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field orientation="vertical">
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <FieldContent>
                <Input
                  id="notes"
                  placeholder="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
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
