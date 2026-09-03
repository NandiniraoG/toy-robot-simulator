/**
 * Movement Tests
 * Tests for robot movement and direction changes
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";
import { TEST_SCENARIOS, TEST_CASES } from "../fixtures/test-data";

test.describe("Toy Robot - Movement Tests", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("MOVE steps the robot one unit in its facing direction (North)", async () => {
    const testCase = TEST_SCENARIOS.movement[0];
    await robot.placeAt(0, 0, "NORTH");
    await robot.move();
    await expect.poll(() => robot.currentState()).toBe(testCase.expected);
  });

  test("MOVE steps the robot one unit East", async () => {
    const testCase = TEST_SCENARIOS.movement[1];
    await robot.placeAt(0, 0, "EAST");
    await robot.move();
    await expect.poll(() => robot.currentState()).toBe(testCase.expected);
  });

  test("LEFT and RIGHT rotate in place without changing position", async () => {
    const testCase = TEST_CASES.ROTATION;
    await robot.placeAt(0, 0, "NORTH");

    await robot.turnLeft();
    await expect.poll(() => robot.currentState()).toBe("0,0,WEST");

    await robot.turnRight();
    await expect.poll(() => robot.currentState()).toBe("0,0,NORTH");
  });

  test("switches to buttons case during movement", async () => {
    robot.switchCase("buttons");
    expect(robot.getCurrentCase()).toBe("buttons");

    await robot.placeAt(1, 1, "NORTH");
    await robot.move();
    await expect.poll(() => robot.currentState()).toBe("1,2,NORTH");
  });

  test("REPORT prints the current state into the command log", async () => {
    await robot.placeAt(3, 3, "SOUTH");
    await robot.report();

    expect(await robot.lastLogLine()).toBe("3,3,SOUTH");
  });
});
