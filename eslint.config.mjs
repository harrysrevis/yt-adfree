import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.plugins("@typescript-eslint"),
  eslintPluginPrettierRecommended,
  {
    ignores: [
      "node_modules/",
      "dist/",
      "*.js",
      "cdk.out",
      "lib",
      "build/",
      ".next/",
      ".turbo/",
      "out/",
      "public/",
      "coverage/",
      "eslint.config.mjs",
      "jest.config.js",
      "next.config.js"
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn"
    }
  }
]

export default eslintConfig
