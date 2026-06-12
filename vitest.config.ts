import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Playwright owns tests/*.spec.ts; vitest only matches tests/unit/**/*.test.ts
// so the two runners never collide.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
