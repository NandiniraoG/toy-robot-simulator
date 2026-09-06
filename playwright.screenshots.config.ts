import { defineConfig, devices } from "@playwright/test";

// Separate, minimal config for scripts/capture-screenshots.spec.ts — kept
// apart from playwright.config.ts so this never mixes into real test results
// or reporting.
export default defineConfig({
  testDir: "./scripts",
  testMatch: "capture-screenshots.spec.ts",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
