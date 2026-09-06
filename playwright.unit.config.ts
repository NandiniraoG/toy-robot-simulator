import { defineConfig } from "@playwright/test";

// Node-only suite: the domain classes in isolation, plus the CLI driven as a
// real subprocess. No browser project, so these never launch Chromium and run
// in a fraction of the time the UI suite takes. Kept in its own config so
// `npm run test:e2e` still means exactly what it did before.
export default defineConfig({
  testDir: "./tests/unit",
  fullyParallel: true,
  // The CLI tests exec dist/cli/main.js, so the build has to run first.
  globalSetup: "./tests/global-setup.ts",
  reporter: [["list"]],
});
