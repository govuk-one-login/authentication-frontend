import typescriptEslint from "@typescript-eslint/eslint-plugin";
import noOnlyTestPlugin from "eslint-plugin-no-only-tests";
import globals from "globals";
import parser from "@typescript-eslint/parser";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

const config = [
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "no-only-tests": noOnlyTestPlugin,
    },
  },
  {
    // name?
    files: ["**/*.ts", "**/*.js", "**/translation.json"],
    languageOptions: {
      parser: parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "error",
      "@typescript-eslint/explicit-module-boundary-types": [
        "warn",
        {
          allowArgumentsExplicitlyTypedAsAny: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "padding-line-between-statements": [
        "error",
        { blankLine: "any", prev: "*", next: "*" },
      ],
      "no-only-tests/no-only-tests": "error",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    settings: {
      // Additional settings can be added here if necessary
    },
  },
  {
    ignores: [
      "scripts/**",
      "src/assets/**",
      "eslint.config.js",
      "*.d.ts",
      "node_modules",
      "dist",
      "functional-output",
      "coverage",
      "src/assets/javascript",
    ],
  },
];

export default config;
