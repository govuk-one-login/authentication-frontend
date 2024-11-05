const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const noOnlyTestPlugin = require("eslint-plugin-no-only-tests");
const globals = require("globals");
const parser = require("@typescript-eslint/parser");
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
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
