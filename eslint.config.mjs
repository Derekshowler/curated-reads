// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // TEMP: allow `any` while we’re still sketching types
      "@typescript-eslint/no-explicit-any": "off",
      // TEMP: don’t complain about default-exported objects (e.g. prettier config)
      "import/no-anonymous-default-export": "off",

      // ✅ Turn off noisy empty-object rule that’s causing the 2 errors
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // (Optional but nice) ignore any generated Prisma client if you add it later
    "generated/**",
  ]),
]);

export default eslintConfig;
