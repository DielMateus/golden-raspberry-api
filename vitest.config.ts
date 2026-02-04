import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "src/server.ts",
        "src/types/**",
        "**/index.ts",
        "src/routes/index.ts",
        "src/database/index.ts",
        "dist/**",
        "tests/**",
        "vitest.config.ts",
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
