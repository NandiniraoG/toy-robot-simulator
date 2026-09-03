/**
 * Boundary and Edge Case Tests
 * Tests for table edge behavior and invalid commands
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";
import { TEST_SCENARIOS } from "../fixtures/test-data";

test.describe("Toy Robot - Boundary and Edge Case Tests", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("MOVE at the table edge (North) is blocked and logged as ignored", async () => {
    const testCase = TEST_SCENARIOS.boundaries[0];
    await robot.placeAt(0, 4, "NORTH");
    await robot.move();

    await expect.poll(() => robot.currentState()).toBe(testCase.expected);
    expect(await robot.lastLogLine()).toBe("(ignored)");
  });

  test("MOVE at table edge (East) is blocked", async () => {
    await robot.placeAt(4, 0, "EAST");
    await robot.move();

    await expect.poll(() => robot.currentState()).toBe("4,0,EAST");
    expect(await robot.lastLogLine()).toBe("(ignored)");
  });

  test("MOVE at table edge (South) is blocked", async () => {
    await robot.placeAt(0, 0, "SOUTH");
    await robot.move();

    await expect.poll(() => robot.currentState()).toBe("0,0,SOUTH");
    expect(await robot.lastLogLine()).toBe("(ignored)");
  });

  test("MOVE at table edge (West) is blocked", async () => {
    await robot.placeAt(0, 0, "WEST");
    await robot.move();

    await expect.poll(() => robot.currentState()).toBe("0,0,WEST");
    expect(await robot.lastLogLine()).toBe("(ignored)");
  });

  test("a malformed typed command is ignored and leaves state unchanged", async () => {
    await robot.placeAt(1, 1, "NORTH");
    await robot.runCommand("JUMP");

    await expect.poll(() => robot.currentState()).toBe("1,1,NORTH");
    expect(await robot.lastLogLine()).toBe("(ignored)");
  });

  test("commands before the first PLACE are ignored", async () => {
    await robot.move();

    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");
  });

  test("multiple invalid commands are all logged", async () => {
    await robot.runCommand("MOVE");
    await robot.runCommand("TURN");
    await robot.runCommand("INVALID");

    const logLines = await robot.getLogLines();
    const ignoredCount = logLines.filter((line) => line === "(ignored)").length;
    expect(ignoredCount).toBe(3);
  });
});
