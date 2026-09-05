/**
 * Toy Robot - End-to-End Tests
 *
 * Five tests, driven through the real web/index.html UI, chosen to each
 * demonstrate a distinct part of the testing approach rather than
 * exhaustively re-parametrizing every variant of every case:
 *   1. UI placement (click-to-place)
 *   2. Correctness against the three official spec examples
 *   3. A boundary/edge case
 *   4. Rotation
 *   5. Negative/invalid input handling
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";

test.describe("Toy Robot", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("places the robot by clicking a cell", async () => {
    expect(await robot.isRobotMarkerVisible()).toBe(false);

    await robot.placeAt(2, 2, "NORTH");

    expect(await robot.isRobotMarkerVisible()).toBe(true);
    await expect.poll(() => robot.currentState()).toBe("2,2,NORTH");
  });

  test("reproduces the three official spec examples via typed commands", async () => {
    await robot.runCommand("PLACE 0,0,NORTH");
    await robot.runCommand("MOVE");
    await robot.runCommand("REPORT");
    expect(await robot.lastLogLine()).toBe("0,1,NORTH"); // example A

    await robot.runCommand("PLACE 0,0,NORTH");
    await robot.runCommand("LEFT");
    await robot.runCommand("REPORT");
    expect(await robot.lastLogLine()).toBe("0,0,WEST"); // example B

    await robot.runCommand("PLACE 1,2,EAST");
    await robot.runCommand("MOVE");
    await robot.runCommand("MOVE");
    await robot.runCommand("LEFT");
    await robot.runCommand("MOVE");
    await robot.runCommand("REPORT");
    expect(await robot.lastLogLine()).toBe("3,3,NORTH"); // example C
  });

  test("MOVE off the edge of the table is blocked", async () => {
    await robot.placeAt(4, 4, "NORTH");
    await robot.move();

    await expect.poll(() => robot.currentState()).toBe("4,4,NORTH");
    expect(await robot.lastLogLine()).toBe("(ignored)");
  });

  test("LEFT and RIGHT rotate the robot without changing its position", async () => {
    await robot.placeAt(2, 2, "NORTH");

    await robot.turnLeft();
    await expect.poll(() => robot.currentState()).toBe("2,2,WEST");

    await robot.turnRight();
    await robot.turnRight();
    await expect.poll(() => robot.currentState()).toBe("2,2,EAST");
  });

  test("invalid input is ignored without corrupting robot state", async () => {
    await robot.move(); // before any PLACE
    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");

    await robot.placeAt(1, 1, "NORTH");
    await robot.runCommand("JUMP"); // malformed command
    expect(await robot.lastLogLine()).toBe("(ignored)");

    await robot.runCommand("PLACE 9,9,NORTH"); // out-of-bounds PLACE
    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("1,1,NORTH");
  });
});
