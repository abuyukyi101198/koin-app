import * as yup from "yup";
import { Issuer } from "@/query/types";

const currentYear = new Date().getFullYear();

export const coinFormSchema = yup.object().shape({
  value: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .required("Value is required")
    .min(0, "Value cannot be negative"),

  currency: yup
    .string()
    .transform((v) => (v?.trim() === "" ? null : v))
    .nullable()
    .required("Currency is required")
    .max(50, "Currency is too long"),

  year: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .required("Year is required")
    .integer("Year must be an integer")
    .min(0, "Year cannot be negative")
    .max(currentYear, "Year cannot be in the future"),

  issuer: yup.mixed<Issuer>().nullable().required("Issuer is required"),

  description: yup
    .string()
    .trim()
    .max(100, "Description is too long")
    .optional(),

  reverseImage: yup
    .string()
    .transform((v) => (v?.trim() === "" ? null : v))
    .url("Reverse image must be a valid URL")
    .optional(),

  obverseImage: yup
    .string()
    .transform((v) => (v?.trim() === "" ? null : v))
    .url("Obverse image must be a valid URL")
    .optional(),

  quantity: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .required("Quantity is required")
    .integer("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),

  saleValue: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .positive("Sale value must be greater than 0")
    .optional(),

  notes: yup.string().trim().max(1000, "Notes are too long").optional(),
});

export type CoinFormData = yup.InferType<typeof coinFormSchema>;
