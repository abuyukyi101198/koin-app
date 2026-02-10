import * as yup from "yup";
import { Issuer } from "@/query/types";

const currentYear = new Date().getFullYear();

export const coinFormSchema = yup.object().shape({
  value: yup
    .string()
    .test(
      "value-format",
      "Value is required and must be a valid number",
      (value) => {
        if (value === "" || value === undefined) return false;
        return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
      }
    )
    .test("value-min", "Value cannot be negative", (value) => {
      if (value === "" || value === undefined) return true;
      return parseFloat(value) >= 0;
    })
    .default(""),

  currency: yup
    .string()
    .required("Currency is required")
    .max(50, "Currency is too long")
    .default(""),

  year: yup
    .string()
    .test(
      "year-format",
      "Year is required and must be a valid number",
      (value) => {
        if (value === "" || value === undefined) return false;
        const num = parseInt(value, 10);
        return !isNaN(num) && Number.isInteger(num);
      }
    )
    .test("year-min", "Year cannot be negative", (value) => {
      if (value === "" || value === undefined) return true;
      return parseInt(value, 10) >= 0;
    })
    .test("year-max", "Year cannot be in the future", (value) => {
      if (value === "" || value === undefined) return true;
      return parseInt(value, 10) <= currentYear;
    })
    .default(""),

  issuer: yup.mixed<Issuer>().nullable().required("Issuer is required"),

  description: yup
    .string()
    .trim()
    .max(100, "Description is too long")
    .default(""),

  reverseImage: yup
    .string()
    .transform((v) => (v?.trim() === "" ? "" : v))
    .test("reverse-image-url", "Reverse image must be a valid URL", (value) => {
      if (value === "" || value === undefined) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .default(""),

  obverseImage: yup
    .string()
    .transform((v) => (v?.trim() === "" ? "" : v))
    .test("obverse-image-url", "Obverse image must be a valid URL", (value) => {
      if (value === "" || value === undefined) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .default(""),

  quantity: yup
    .string()
    .test(
      "quantity-format",
      "Quantity is required and must be a valid whole number",
      (value) => {
        if (value === "" || value === undefined) return false;
        const num = parseInt(value, 10);
        return !isNaN(num) && Number.isInteger(num);
      }
    )
    .test("quantity-min", "Quantity must be at least 1", (value) => {
      if (value === "" || value === undefined) return true;
      return parseInt(value, 10) >= 1;
    })
    .test("quantity-max", "Quantity cannot exceed 99", (value) => {
      if (value === "" || value === undefined) return true;
      return parseInt(value, 10) <= 99;
    })
    .default(""),

  saleValue: yup
    .string()
    .test("sale-value-format", "Sale value must be a valid number", (value) => {
      if (value === "" || value === undefined) return true;
      return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    })
    .test(
      "sale-value-positive",
      "Sale value must be greater than 0",
      (value) => {
        if (value === "" || value === undefined) return true;
        return parseFloat(value) > 0;
      }
    )
    .default(""),

  notes: yup.string().trim().max(1000, "Notes are too long").default(""),
});

export type CoinFormData = yup.InferType<typeof coinFormSchema>;
