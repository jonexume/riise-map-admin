import { defineConfig, InputTransformerFn } from "orval";

// Our exports make assumptions about the title of the API being "Api" (i.e. generated output is `api.ts`).
const titleTransformer: InputTransformerFn = (config) => {
  config.info ??= {};
  config.info.title = "Api";

  return config;
};

export default defineConfig({
  "api-client-react": {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      // Note: `workspace` is not a standard orval option, we use `target` instead
      target: "../api-client-react/src/generated",
      client: "react-query",
      mode: "split", // This was the critical error, it should be 'split'
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          // Use a relative path from the config file
          path: "../api-client-react/src/custom-fetch.ts",
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      // Note: `workspace` is not a standard orval option, we use `target` and `schemas` instead
      target: "../api-zod/src/generated/api.ts",
      schemas: "../api-zod/src/generated/types",
      client: "zod",
      mode: "split", // This was the critical error, it should be 'split'
      clean: true,
      prettier: true,
      override: {
        zod: {
          coerce: {
            query: ['boolean', 'number', 'string'],
            param: ['boolean', 'number', 'string'],
            body: ['bigint', 'date'],
            response: ['bigint', 'date'],
          },
        },
        useDates: true,
        useBigInt: true,
      },
    },
  },
});
