module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    browser: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module"
      }
    }
  ],
  extends: [],
  ignorePatterns: ["dist", "node_modules"]
};
