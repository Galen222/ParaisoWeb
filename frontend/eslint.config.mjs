import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // Deuda previa: se mantiene visible, pero no bloquea la migración.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",

      // Reglas nuevas de React 19/React Compiler.
      // Se revisarán en una refactorización independiente.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "docs/**",
    "next-env.d.ts",

    // Scripts auxiliares que revisarás posteriormente.
    "generate-sitemap.js",
    "next-sitemap.config.js",
  ]),
]);
