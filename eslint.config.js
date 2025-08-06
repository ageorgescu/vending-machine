const eslintRecommended = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");
const globals = require("globals");
const jestPlugin = require("eslint-plugin-jest");

module.exports = [
  {
    ignores: [
      "coverage/**/*",
      "coverage/lcov-report/**/*",
      "dist/**/*",
      "eslint.config.js",
    ],
  },
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
    },
    files: ["src/**/*.ts"],

    rules: {
      ...tseslint.configs.recommended.rules,
      ...eslintRecommended.configs.recommended.rules,
      "prettier/prettier": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      globals: {
        ...globals.jest,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      jest: jestPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...eslintRecommended.configs.recommended.rules,
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "jest/valid-expect": [
        "error",
        {
          maxArgs: 2,
        },
      ],
    },
  },
];
