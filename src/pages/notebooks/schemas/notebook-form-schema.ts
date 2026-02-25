import * as yup from "yup";

export const notebookFormSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .max(100, "Title cannot exceed 100 characters.")
    .default(""),

  description: yup
    .string()
    .trim()
    .max(100, "Description cannot exceed 100 characters.")
    .default(""),

  rows_per_page: yup
    .string()
    .test("rows-format", "Number of rows must be a valid number.", (value) => {
      if (value === "" || value === undefined) return false;
      return !isNaN(parseInt(value)) && isFinite(parseInt(value));
    })
    .test("rows-min", "Number of rows cannot be negative.", (value) => {
      if (value === "" || value === undefined) return true;
      return parseInt(value) >= 0;
    })
    .default(""),

  columns_per_page: yup
    .string()
    .test(
      "columns-format",
      "Number of columns must be a valid number.",
      (value) => {
        if (value === "" || value === undefined) return false;
        return !isNaN(parseInt(value)) && isFinite(parseInt(value));
      }
    )
    .test("columns-min", "Number of columns cannot be negative.", (value) => {
      if (value === "" || value === undefined) return true;
      return parseInt(value) >= 0;
    })
    .default(""),

  number_of_pages: yup
    .string()
    .test(
      "pages-format",
      "Number of pages must be a valid number.",
      (value) => {
        if (value === "" || value === undefined) return false;
        return !isNaN(parseInt(value)) && isFinite(parseInt(value));
      }
    )
    .test("pages-min", "Number of pages cannot be negative.", (value) => {
      if (value === "" || value === undefined) return true;
      return parseInt(value) >= 0;
    })
    .default(""),
});

export type NotebookFormData = yup.InferType<typeof notebookFormSchema>;
