import { FormikProps } from "formik";

import { ImageUploadField } from "@/components/composite/image-upload.tsx";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field.tsx";
import { CoinFormData } from "@/pages/coins/schemas/coin-form-schema.ts";
import { resolveImageSrc } from "@/utils/resolveImageSrc.ts";

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
      <Field className="flex-1 gap-2" orientation="vertical">
        <FieldLabel>Reverse Image</FieldLabel>
        <FieldContent>
          <ImageUploadField
            label="Reverse image"
            onChange={async (url) => {
              await setFieldValue("reverseImage", url);
              await setFieldTouched("reverseImage", true, false);
            }}
            value={resolveImageSrc(value.reverseImage)}
          />
        </FieldContent>
      </Field>
      <Field className="flex-1 gap-2" orientation="vertical">
        <FieldLabel>Obverse Image</FieldLabel>
        <FieldContent>
          <ImageUploadField
            label="Obverse image"
            onChange={async (url) => {
              await setFieldValue("obverseImage", url);
              await setFieldTouched("obverseImage", true, false);
            }}
            value={resolveImageSrc(value.obverseImage)}
          />
        </FieldContent>
      </Field>
    </>
  );
}
