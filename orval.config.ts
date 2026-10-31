import { defineConfig } from "orval";

// The contract is Backend/openapi.json (export it with `pnpm openapi:export` in Backend/).
export default defineConfig({
  skillswap: {
    input: "../Backend/openapi.json",
    output: {
      mode: "tags-split",
      target: "src/lib/api/generated",
      schemas: "src/lib/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        mutator: { path: "./src/lib/api/fetcher.ts", name: "apiFetch" },
      },
    },
  },
});
