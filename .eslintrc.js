module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  rules: {
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": 2,
    "@typescript-eslint/explicit-module-boundary-types": [
      "warn",
      {
        allowArgumentsExplicitlyTypedAsAny: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": ["error"],
    "padding-line-between-statements": [
      "error",
      { blankLine: "any", prev: "*", next: "*" },
    ],
  },
};
