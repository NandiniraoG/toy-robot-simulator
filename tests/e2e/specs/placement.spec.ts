/**
 * Placement Tests
 * Placing the robot on the board via the UI, and the state readout before
 * any placement has happened.
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";

test.describe("Toy Robot - Placement", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("shows no state until the robot is placed", async () => {
    expect(await robot.isRobotMarkerVisible()).toBe(false);
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");
  });

  test("places the robot by clicking a cell", async () => {
    await robot.placeAt(0, 0, "NORTH");

    expect(await robot.isRobotMarkerVisible()).toBe(true);
    await expect.poll(() => robot.currentState()).toBe("0,0,NORTH");
  });

  test("re-placing at a new cell replaces the robot rather than adding another", async () => {
    await robot.placeAt(0, 0, "NORTH");
    await robot.placeAt(4, 4, "WEST");

    await expect(robot.robotMarker).toHaveCount(1);
    await expect.poll(() => robot.currentState()).toBe("4,4,WEST");
  });

  test("re-placing at the same coordinate and facing is not logged as ignored", async () => {
    await robot.placeAt(2, 2, "EAST");
    await robot.placeAt(2, 2, "EAST");

    await expect.poll(() => robot.currentState()).toBe("2,2,EAST");
    expect(await robot.lastLogLine()).not.toBe("(ignored)");
  });
});
