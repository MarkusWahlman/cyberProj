import { defineConfig } from "oxlint";

export default defineConfig({
  env: {
    es2024: true,
  },
  ignorePatterns: [
    "**/dist",
    "**/node_modules/**",
  ],
  categories: {
    correctness: "error",
    suspicious: "error",
    pedantic: "warn",
    perf: "warn",
    style: "off",
  },
  rules: {
    "require-await": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "no-restricted-imports": [
      "error",
      {
        "paths": [
          {
            "name": "express",
            "importNames": ["Router"],
            "message": "Please use StrictRouter from 'src/utils/strictRouter.ts' instead of importing Router directly from express."
          },
          {
            "name": "express",
            "importNames": ["Response"],
            "message": "Please use TypedResponse<T> from 'src/utils/typedExpress.ts' instead of raw Response to guarantee strict response payload typing."
          },
          {
            "name": "express",
            "importNames": ["Request"],
            "message": "Please use TypedRequest helpers from 'src/utils/typedExpress.ts' instead of raw Request to guarantee strict request payload typing."
          }
        ]
      }
    ],
    "no-console": "error"
  },
});