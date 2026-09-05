/**
 * Movement Tests
 * MOVE in each facing direction and LEFT/RIGHT rotation, driven through the
 * UI's command buttons.
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage, type Facing } from "../pages/toy-robot.page";

test.describe("Toy Robot - Movement", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  for (const [facing, expected] of [
    ["NORTH", "2,3,NORTH"],
    ["EAST", "3,2,EAST"],
    ["SOUTH", "2,1,SOUTH"],
    ["WEST", "1,2,WEST"],
  ] as [Facing, string][]) {
    test(`MOVE steps the robot one unit ${facing}`, async () => {
      await robot.placeAt(2, 2, facing);
      await robot.move();
      await expect.poll(() => robot.currentState()).toBe(expected);
    });
  }

  test("four consecutive LEFT commands return to the original facing", async () => {
    await robot.placeAt(2, 2, "NORTH");

    await robot.turnLeft();
    await robot.turnLeft();
    await robot.turnLeft();
    await robot.turnLeft();

    await expect.poll(() => robot.currentState()).toBe("2,2,NORTH");
  });

  test("four consecutive RIGHT commands return to the original facing", async () => {
    await robot.placeAt(2, 2, "NORTH");

    await robot.turnRight();
    await robot.turnRight();
    await robot.turnRight();
    await robot.turnRight();

    await expect.poll(() => robot.currentState()).toBe("2,2,NORTH");
  });

  for (const [command, from, to] of [
    ["LEFT", "NORTH", "WEST"],
    ["LEFT", "WEST", "SOUTH"],
    ["LEFT", "SOUTH", "EAST"],
    ["LEFT", "EAST", "NORTH"],
    ["RIGHT", "NORTH", "EAST"],
    ["RIGHT", "EAST", "SOUTH"],
    ["RIGHT", "SOUTH", "WEST"],
    ["RIGHT", "WEST", "NORTH"],
  ] as [string, Facing, string][]) {
    test(`${command} turns ${from} into ${to}`, async () => {
      await robot.placeAt(2, 2, from);

      if (command === "LEFT") {
        await robot.turnLeft();
      } else {
        await robot.turnRight();
      }

      await expect.poll(() => robot.currentState()).toBe(`2,2,${to}`);
    });
  }

  test("REPORT prints the current state into the command log", async () => {
    await robot.placeAt(3, 3, "SOUTH");
    await robot.report();

    expect(await robot.lastLogLine()).toBe("3,3,SOUTH");
  });
});
