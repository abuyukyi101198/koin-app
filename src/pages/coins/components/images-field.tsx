import { CoinFormData } from "@/pages/coins/components/schemas/coin-form-schema.ts";
import { FormikProps } from "formik";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { ImageUploadField } from "@/components/composite/image-upload.tsx";

interface ImagesFieldProps {
  value: {
    reverseImage: CoinFormData["reverseImage"];
    obverseImage: CoinFormData["obverseImage"];
  };
  setFieldValue: FormikProps<CoinFormData>["setFieldValue"];
  setFieldTouched: FormikProps<CoinFormData>["setFieldTouched"];
}

export function ImagesField({
  value,
  setFieldValue,
  setFieldTouched,
}: ImagesFieldProps) {
  return (
    <>
      <Field orientation="vertical" className="flex-1 gap-1">
        <FieldLabel>Reverse Image</FieldLabel>
        <FieldContent>
          <ImageUploadField
            label="Reverse image"
            value={value.reverseImage}
            onChange={async (url) => {
              await setFieldValue("reverseImage", url);
              await setFieldTouched("reverseImage", true, false);
            }}
          />
        </FieldContent>
      </Field>
      <Field orientation="vertical" className="flex-1 gap-1">
        <FieldLabel>Obverse Image</FieldLabel>
        <FieldContent>
          <ImageUploadField
            label="Obverse image"
            value={value.obverseImage}
            onChange={async (url) => {
              await setFieldValue("obverseImage", url);
              await setFieldTouched("obverseImage", true, false);
            }}
          />
        </FieldContent>
      </Field>
    </>
  );
}
