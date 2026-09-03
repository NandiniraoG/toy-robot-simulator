/**
 * Placement Tests
 * Tests for robot placement functionality
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";
import { TEST_SCENARIOS } from "../fixtures/test-data";

test.describe("Toy Robot - Placement Tests", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("shows no state until the robot is placed", async () => {
    const testCase = TEST_SCENARIOS.placement[0];
    await expect.poll(() => robot.currentState()).toBe(testCase.expected);
  });

  test("places the robot by clicking a cell", async () => {
    const testCase = TEST_SCENARIOS.placement[1];
    await robot.placeAt(0, 0, "NORTH");
    await expect.poll(() => robot.currentState()).toBe(testCase.expected);
  });

  test("re-placing at the same coordinate and facing is not logged as ignored", async () => {
    await robot.placeAt(2, 2, "EAST");
    await robot.placeAt(2, 2, "EAST");

    await expect.poll(() => robot.currentState()).toBe("2,2,EAST");
    expect(await robot.lastLogLine()).not.toBe("(ignored)");
  });

  test("switches case context during placement", async () => {
    robot.switchCase("placement");
    expect(robot.getCurrentCase()).toBe("placement");

    await robot.placeAt(1, 1, "NORTH");
    await expect.poll(() => robot.currentState()).toBe("1,1,NORTH");
  });
});
