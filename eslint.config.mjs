import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Suppress or change severity of specific rules
      "react/no-unescaped-entities": "warn", // Warn for unescaped characters instead of error
      "@typescript-eslint/no-explicit-any": "warn", // Warn for 'any' instead of error
      "@typescript-eslint/no-unused-vars": "warn", // Warn for unused variables
      "@next/next/no-img-element": "warn", // Warn for <img> usage instead of error
      "jsx-a11y/alt-text": "warn", // Warn for missing alt attributes
    },
  },
];

export default eslintConfig;
