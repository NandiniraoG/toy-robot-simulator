import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  // Compiles src/ to dist/web/app.js before anything opens the page.
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: true,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Set PW_SLOWMO=<ms> to pause between actions when watching a run live
    // (e.g. in UI mode). Unset in normal/CI runs, so it never affects speed
    // there.
    launchOptions: {
      slowMo: process.env.PW_SLOWMO ? Number(process.env.PW_SLOWMO) : undefined,
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
