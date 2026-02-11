import { FormikProps } from "formik";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group.tsx";
import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";

interface SaleValueFieldProps {
  value: CoinFormData["saleValue"];
  touched: FormikProps<CoinFormData>["touched"]["saleValue"];
  error: FormikProps<CoinFormData>["errors"]["saleValue"];
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
}

export function SaleValueField({
  value,
  touched,
  error,
  setFieldValue,
  setFieldTouched,
}: SaleValueFieldProps) {
  const validateInputOnChange = async (value: string) => {
    if (!/^[0-9]*\.?[0-9]{0,2}$/.test(value)) return;
    await setFieldValue("saleValue", value, true);
    await setFieldTouched("saleValue", true, false);
  };

  return (
    <Field className="flex-1 gap-1" orientation="vertical">
      <FieldLabel className="justify-end" htmlFor="saleValue">
        Est. sale value
      </FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            aria-describedby={touched && error ? "saleValue-error" : undefined}
            aria-invalid={touched && !!error}
            autoCapitalize="off"
            autoComplete="off"
            className="[&::-webkit-inner-spin-button]:appearance-none text-right"
            id="saleValue"
            onChange={async (e) => validateInputOnChange(e.target.value)}
            placeholder="0.00"
            step="0.01"
            value={value}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </FieldContent>
    </Field>
  );
}
