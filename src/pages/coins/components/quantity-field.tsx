import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { FormikProps } from "formik";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MinusIcon, PlusIcon } from "lucide-react";

interface QuantityFieldProps {
  value: CoinFormData["quantity"];
  touched: FormikProps<CoinFormData>["touched"]["quantity"];
  error: FormikProps<CoinFormData>["errors"]["quantity"];
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
}

export function QuantityField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: QuantityFieldProps) {
  return (
    <Field orientation="vertical" className="flex-1 gap-1">
      <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
      <FieldContent>
        <ButtonGroup className="w-full">
          <Button
            className="border-r-0"
            type="button"
            aria-label="Decrease quantity"
            variant="outline"
            disabled={Number(value) <= 1}
            onClick={async () =>
              await setFieldValue("quantity", (Number(value) - 1).toString())
            }
          >
            <MinusIcon />
          </Button>
          <Input
            aria-invalid={touched && !!error}
            aria-describedby={touched && error ? "quantity-error" : undefined}
            className="[&::-webkit-inner-spin-button]:appearance-none text-center border!"
            id="quantity"
            min="1"
            max="100"
            value={value}
            onChange={async (e) => {
              await setFieldValue("quantity", e.target.value);
              await setFieldTouched("quantity", true, false);
            }}
            onBlur={() => {}}
          />
          <Button
            className="border-l-0"
            type="button"
            aria-label="Increase quantity"
            variant="outline"
            disabled={Number(value) >= 100}
            onClick={async () =>
              await setFieldValue("quantity", (Number(value) + 1).toString())
            }
          >
            <PlusIcon />
          </Button>
        </ButtonGroup>
      </FieldContent>
    </Field>
  );
}
