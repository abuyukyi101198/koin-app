import js from "@eslint/js";
import tseslint from "typescript-eslint";

import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import noOnlyTests from "eslint-plugin-no-only-tests";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import unusedImports from "eslint-plugin-unused-imports";

const commonRules = {
  /* =====================
     Formatting
  ====================== */
  "prettier/prettier": "error",

  /* =====================
     React
  ====================== */
  "react/jsx-sort-props": "error",
  "react/no-multi-comp": "off",

  "react/forbid-component-props": [
    "error",
    {
      forbid: [
        {
          propName: "data-test",
          message: "Use `data-testid` instead.",
        },
      ],
    },
  ],

  "react/forbid-dom-props": [
    "error",
    {
      forbid: [
        {
          propName: "data-test",
          message: "Use `data-testid` instead.",
        },
      ],
    },
  ],

  /* =====================
     React Hooks
  ====================== */
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",

  /* =====================
     Imports
  ====================== */
  "import/order": [
    "error",
    {
      pathGroups: [
        {
          pattern: "react",
          group: "external",
          position: "before",
        },
        {
          pattern: "~/app",
          group: "internal",
        },
      ],
      pathGroupsExcludedImportTypes: ["react"],
      "newlines-between": "always",
      alphabetize: { order: "asc" },
    },
  ],

  "import/namespace": "off",
  "import/no-named-as-default": "off",

  /* =====================
     Unused Imports
  ====================== */
  "@typescript-eslint/no-unused-vars": "off",
  "unused-imports/no-unused-imports": "error",
  "unused-imports/no-unused-vars": [
    "warn",
    {
      vars: "all",
      varsIgnorePattern: "^_",
      args: "after-used",
      argsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ],

  /* =====================
     Complexity
  ====================== */
  complexity: ["error", { max: 34 }],
  "no-console": "warn",

  /* =====================
     Non-Type-Aware TypeScript
  ====================== */
  "@typescript-eslint/array-type": "error",
  "@typescript-eslint/consistent-indexed-object-style": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-for-in-array": "error",
  "@typescript-eslint/no-import-type-side-effects": "error",
  "@typescript-eslint/no-inferrable-types": "error",
  "@typescript-eslint/sort-type-constituents": "error",
  "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
};

const commonPlugins = {
  react,
  "react-hooks": reactHooks,
  import: importPlugin,
  prettier: prettierPlugin,
  "unused-imports": unusedImports,
  "testing-library": testingLibrary,
  "no-only-tests": noOnlyTests,
};

const commonSettings = {
  react: {
    version: "detect",
  },
  "import/resolver": {
    typescript: true,
    node: {
      paths: ["src"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
  },
};

export default tseslint.config(
  // Ignore patterns
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      "src-tauri/target/",
      "eslint.config.js",
    ],
  },

  // Base JS recommended
  js.configs.recommended,

  // TypeScript recommended (flat-safe)
  ...tseslint.configs.recommended,

  // Config files and general JavaScript files (non-src)
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    plugins: commonPlugins,

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    settings: commonSettings,

    rules: commonRules,
  },

  // Source TypeScript files with type-aware rules
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: commonPlugins,

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
      },
    },

    settings: commonSettings,

    rules: {
      ...commonRules,

      /* =====================
         Type-Aware TypeScript
      ====================== */
      "@typescript-eslint/dot-notation": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/no-confusing-void-expression": "error",
      "@typescript-eslint/no-duplicate-type-constituents": "error",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/prefer-regexp-exec": "error",
    },
  },

  // Test files
  {
    files: ["src/**/*.test.[jt]s?(x)"],

    rules: {
      "no-only-tests/no-only-tests": "error",

      "testing-library/prefer-explicit-assert": "error",
      "testing-library/prefer-find-by": "off",
      "testing-library/prefer-user-event": [
        "error",
        { allowedMethods: ["change"] },
      ],
    },
  }
);
