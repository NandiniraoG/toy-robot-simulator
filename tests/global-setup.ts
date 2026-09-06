import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

/**
 * The suite drives src/web/index.html straight off disk, and that page loads the
 * compiled bundle at dist/web/app.js. Building here rather than leaving it to
 * the caller means every entry point — `npm run test:e2e`, `--ui`, `--headed`,
 * `--debug`, `npm run screenshots`, or a bare `npx playwright test` — always
 * runs against output built from the current src/.
 *
 * Lives outside testDir on purpose, so it is never collected as a test.
 */
export default function globalSetup(): void {
  execSync("npm run build", { cwd: ROOT, stdio: "inherit" });
}
