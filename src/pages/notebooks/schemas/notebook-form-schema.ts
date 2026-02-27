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
    .test("rows-range", "Number of rows must be between 1 and 50.", (value) => {
      if (value === "" || value === undefined) return true;
      const num = parseInt(value);
      return num >= 0 && num <= 50;
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
    .test(
      "columns-range",
      "Number of columns must be between 1 and 50.",
      (value) => {
        if (value === "" || value === undefined) return true;
        const num = parseInt(value);
        return num >= 1 && num <= 50;
      }
    )
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
    .test(
      "pages-range",
      "Number of pages must be between 1 and 50.",
      (value) => {
        if (value === "" || value === undefined) return true;
        const num = parseInt(value);
        return num >= 1 && num <= 50;
      }
    )
    .default(""),
});

export type NotebookFormData = yup.InferType<typeof notebookFormSchema>;
