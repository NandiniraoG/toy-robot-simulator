/**
 * Negative and Invalid Input Tests
 * Malformed PLACE syntax, out-of-bounds PLACE, garbage/keyword-like
 * commands, and whitespace handling - all verified through the actual
 * web/index.html UI rather than the domain classes directly.
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";

test.describe("Toy Robot - Negative and Invalid Input", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("LEFT and RIGHT before any PLACE are ignored", async () => {
    await robot.turnLeft();
    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");

    await robot.turnRight();
    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");
  });

  test("a typed REPORT before any PLACE is ignored", async () => {
    await robot.runCommand("REPORT");

    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");
  });

  for (const badPlace of [
    "PLACE 1,1",
    "PLACE 1,1,",
    "PLACE ,1,NORTH",
    "PLACE 1.5,1,NORTH",
    "PLACE 1,1,NORTHEAST",
    "PLACE one,1,NORTH",
  ]) {
    test(`a malformed PLACE is ignored and the robot stays unplaced: ${badPlace}`, async () => {
      await robot.runCommand(badPlace);

      expect(await robot.lastLogLine()).toBe("(ignored)");
      await expect.poll(() => robot.currentState()).toBe("(not placed yet)");
    });
  }

  for (const outOfBounds of ["PLACE 5,5,NORTH", "PLACE 5,0,EAST", "PLACE -1,0,NORTH", "PLACE 0,-1,SOUTH"]) {
    test(`an out-of-bounds PLACE is ignored and the robot stays unplaced: ${outOfBounds}`, async () => {
      await robot.runCommand(outOfBounds);

      expect(await robot.lastLogLine()).toBe("(ignored)");
      await expect.poll(() => robot.currentState()).toBe("(not placed yet)");
    });
  }

  for (const garbage of ["MOVEX", "REPORTING", "PLACE1,1,NORTH", "LEFTOVER"]) {
    test(`a keyword-like command with trailing/leading garbage is ignored: ${garbage}`, async () => {
      await robot.placeAt(1, 1, "NORTH");
      await robot.runCommand(garbage);

      expect(await robot.lastLogLine()).toBe("(ignored)");
      await expect.poll(() => robot.currentState()).toBe("1,1,NORTH");
    });
  }

  test("a failed PLACE does not corrupt a previously valid placement", async () => {
    await robot.placeAt(2, 2, "EAST");
    await robot.runCommand("PLACE 9,9,NORTH");

    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("2,2,EAST");
  });

  test("whitespace-only command input is not submitted and the field is left untouched", async () => {
    await robot.placeAt(1, 1, "NORTH");
    const linesBefore = await robot.getLogLines();

    await robot.commandInput.fill("   ");
    await robot.runButton.click();

    expect(await robot.getLogLines()).toEqual(linesBefore);
    await expect(robot.commandInput).toHaveValue("   ");
  });

  test("typed commands are case-insensitive (upper-cased before executing)", async () => {
    await robot.runCommand("place 3,3,south");
    await expect.poll(() => robot.currentState()).toBe("3,3,SOUTH");

    await robot.runCommand("move");
    await expect.poll(() => robot.currentState()).toBe("3,2,SOUTH");
  });

  test("extra whitespace around PLACE arguments is tolerated", async () => {
    await robot.runCommand("PLACE   1 , 1 , NORTH");

    await expect.poll(() => robot.currentState()).toBe("1,1,NORTH");
    expect(await robot.lastLogLine()).not.toBe("(ignored)");
  });
});
