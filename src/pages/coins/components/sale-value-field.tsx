import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { FormikProps } from "formik";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group.tsx";

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
            aria-invalid={touched && !!error}
            aria-describedby={touched && error ? "saleValue-error" : undefined}
            className="[&::-webkit-inner-spin-button]:appearance-none text-right"
            id="saleValue"
            step="0.01"
            placeholder="0.00"
            autoComplete="off"
            autoCapitalize="off"
            value={value}
            onChange={async (e) => validateInputOnChange(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </FieldContent>
    </Field>
  );
}
