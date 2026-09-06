// Not a test: captures one screenshot per OFFICIAL_EXAMPLES entry, driving the
// real page exactly like tests/e2e/specs/toy-robot.spec.ts does. Lives outside
// tests/e2e so it's never picked up by `npm run test:e2e` or counted as a test
// result — run explicitly via `npm run screenshots`.
import fs from "node:fs";
import { test } from "@playwright/test";
import { ToyRobotPage } from "../tests/e2e/pages/toy-robot.page.ts";
import { OFFICIAL_EXAMPLES } from "../tests/e2e/data/toy-robot.testdata.ts";

const OUT_DIR = "docs/screenshots";
const FILES = ["example-a.png", "example-b.png", "example-c.png"];

test.use({ viewport: { width: 1100, height: 760 } });

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

OFFICIAL_EXAMPLES.forEach((example, i) => {
  test(`capture ${example.name}`, async ({ page }) => {
    const robot = new ToyRobotPage(page);
    await robot.goto();
    await robot.runCommands(example.commands);
    await page.screenshot({ path: `${OUT_DIR}/${FILES[i]}`, fullPage: true });
  });
});
