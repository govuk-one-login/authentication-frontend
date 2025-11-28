module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
  },
  env: {
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist/", "reports/**", "node_modules/**"],
  rules: {
    // Allow console in this test framework (Node scripts, debug logs, etc)
    "no-console": "off",

    // Don’t force explicit return types on every exported function here
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};
