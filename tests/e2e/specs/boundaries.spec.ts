/**
 * Boundary Tests
 * MOVE is blocked at every edge of the tabletop, and commands issued before
 * the first PLACE (or entirely malformed) are ignored rather than crashing
 * the page.
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage, type Facing } from "../pages/toy-robot.page";

test.describe("Toy Robot - Boundaries", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  for (const [x, y, facing] of [
    [0, 0, "SOUTH"],
    [0, 0, "WEST"],
    [4, 4, "NORTH"],
    [4, 4, "EAST"],
  ] as [number, number, Facing][]) {
    test(`MOVE off the tabletop is blocked for PLACE ${x},${y},${facing}`, async () => {
      await robot.placeAt(x, y, facing);
      await robot.move();

      await expect.poll(() => robot.currentState()).toBe(`${x},${y},${facing}`);
      expect(await robot.lastLogLine()).toBe("(ignored)");
    });
  }

  test("commands before the first PLACE are ignored", async () => {
    await robot.move();

    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");
  });

  test("a malformed typed command is ignored and leaves state unchanged", async () => {
    await robot.placeAt(1, 1, "NORTH");
    await robot.runCommand("JUMP");

    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("1,1,NORTH");
  });

  test("multiple invalid commands are all logged as ignored", async () => {
    await robot.runCommand("MOVE");
    await robot.runCommand("TURN");
    await robot.runCommand("INVALID");

    const logLines = await robot.getLogLines();
    const ignoredCount = logLines.filter((line) => line === "(ignored)").length;
    expect(ignoredCount).toBe(3);
  });
});
