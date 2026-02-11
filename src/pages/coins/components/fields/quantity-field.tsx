import { FormikProps } from "formik";
import { MinusIcon, PlusIcon } from "lucide-react";

import { ButtonGroup } from "@/components/ui/button-group.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";

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
        <ButtonGroup className="w-full">
          <Button
            aria-label="Decrease quantity"
            className="border-r-0"
            disabled={Number(value) <= 1}
            onClick={async () =>
              await setFieldValue("quantity", (Number(value) - 1).toString())
            }
            type="button"
            variant="outline"
          >
            <MinusIcon />
          </Button>
          <Input
            aria-describedby={touched && error ? "quantity-error" : undefined}
            aria-invalid={touched && !!error}
            className="[&::-webkit-inner-spin-button]:appearance-none text-center border!"
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
          <Button
            aria-label="Increase quantity"
            className="border-l-0"
            disabled={Number(value) >= 99}
            onClick={async () =>
              await setFieldValue("quantity", (Number(value) + 1).toString())
            }
            type="button"
            variant="outline"
          >
            <PlusIcon />
          </Button>
        </ButtonGroup>
      </FieldContent>
    </Field>
  );
}
