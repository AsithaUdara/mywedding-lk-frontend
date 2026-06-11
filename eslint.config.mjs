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
      // App Router: fonts loaded in root layout (next/font/google blocked on some corporate SSL networks)
      "@next/next/no-page-custom-font": "off",
    },
  },
];

export default eslintConfig;
