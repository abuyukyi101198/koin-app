import { FormikProps } from "formik";
import { MinusIcon, PlusIcon } from "lucide-react";

import { ButtonGroup } from "@/components/ui/button-group.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CoinFormData } from "@/pages/coins/schemas/coin-form-schema.ts";

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
    <Field className="flex-1 gap-1" orientation="vertical">
      <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
      <FieldContent>
        <ButtonGroup className="w-full border-b">
          <ButtonGroup>
            <Button
              aria-label="Decrease quantity"
              className="rounded-b-none cursor-pointer"
              disabled={Number(value) <= 1}
              onClick={async () =>
                await setFieldValue("quantity", (Number(value) - 1).toString())
              }
              type="button"
              variant="ghost"
            >
              <MinusIcon />
            </Button>
          </ButtonGroup>
          <Input
            aria-describedby={touched && error ? "quantity-error" : undefined}
            aria-invalid={touched && !!error}
            className="[&::-webkit-inner-spin-button]:appearance-none text-center border-0 rounded-none bg-background! focus-visible:ring-0"
            id="quantity"
            max="100"
            min="1"
            onBlur={() => {}}
            onChange={async (e) => {
              if (!/^[0-9]{1,2}$/.test(e.target.value)) return;
              await setFieldValue("quantity", e.target.value);
              await setFieldTouched("quantity", true, false);
            }}
            value={value}
          />
          <ButtonGroup>
            <Button
              aria-label="Increase quantity"
              className="rounded-b-none cursor-pointer"
              disabled={Number(value) >= 99}
              onClick={async () =>
                await setFieldValue("quantity", (Number(value) + 1).toString())
              }
              type="button"
              variant="ghost"
            >
              <PlusIcon />
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </FieldContent>
    </Field>
  );
}
