import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "./pages/toy-robot.page";

test.describe("Toy Robot web demo", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("shows no state until the robot is placed", async () => {
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");
  });

  test("places the robot by clicking a cell", async () => {
    await robot.placeAt(0, 0, "NORTH");

    await expect.poll(() => robot.currentState()).toBe("0,0,NORTH");
  });

  test("MOVE steps the robot one unit in its facing direction", async () => {
    await robot.placeAt(0, 0, "NORTH");
    await robot.move();

    await expect.poll(() => robot.currentState()).toBe("0,1,NORTH");
  });

  test("MOVE at the table edge is blocked and logged as ignored", async () => {
    await robot.placeAt(0, 4, "NORTH");
    await robot.move();

    await expect.poll(() => robot.currentState()).toBe("0,4,NORTH");
    expect(await robot.lastLogLine()).toBe("(ignored)");
  });

  test("LEFT and RIGHT rotate in place without changing position", async () => {
    await robot.placeAt(0, 0, "NORTH");

    await robot.turnLeft();
    await expect.poll(() => robot.currentState()).toBe("0,0,WEST");

    await robot.turnRight();
    await expect.poll(() => robot.currentState()).toBe("0,0,NORTH");
  });

  test("re-placing at the same coordinate and facing is not logged as ignored", async () => {
    // Regression test: the log used to infer "ignored" by comparing the
    // report string before/after a command, which falsely flagged a
    // successful re-PLACE at an unchanged spot as ignored.
    await robot.placeAt(2, 2, "EAST");
    await robot.placeAt(2, 2, "EAST");

    await expect.poll(() => robot.currentState()).toBe("2,2,EAST");
    expect(await robot.lastLogLine()).not.toBe("(ignored)");
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

  test("REPORT prints the current state into the command log", async () => {
    await robot.placeAt(3, 3, "SOUTH");
    await robot.report();

    expect(await robot.lastLogLine()).toBe("3,3,SOUTH");
  });

  test("reproduces spec example A via typed commands", async () => {
    await robot.runCommand("PLACE 0,0,NORTH");
    await robot.runCommand("MOVE");
    await robot.runCommand("REPORT");

    expect(await robot.lastLogLine()).toBe("0,1,NORTH");
  });

  test("reproduces spec example B via typed commands", async () => {
    await robot.runCommand("PLACE 0,0,NORTH");
    await robot.runCommand("LEFT");
    await robot.runCommand("REPORT");

    expect(await robot.lastLogLine()).toBe("0,0,WEST");
  });

  test("reproduces spec example C via typed commands", async () => {
    await robot.runCommand("PLACE 1,2,EAST");
    await robot.runCommand("MOVE");
    await robot.runCommand("MOVE");
    await robot.runCommand("LEFT");
    await robot.runCommand("MOVE");
    await robot.runCommand("REPORT");

    expect(await robot.lastLogLine()).toBe("3,3,NORTH");
  });
});
