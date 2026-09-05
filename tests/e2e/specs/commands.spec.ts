/**
 * Typed Command Input Tests
 * The raw command text box: reproducing the official spec examples,
 * submitting via Enter, and how empty/blank input is handled.
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";

test.describe("Toy Robot - Typed Commands", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
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

  test("handles empty command input gracefully", async () => {
    await robot.placeAt(1, 1, "NORTH");
    const stateBefore = await robot.currentState();

    await robot.runCommand("");

    expect(await robot.currentState()).toBe(stateBefore);
  });

  test("clears input field after command submission", async () => {
    await robot.runCommand("PLACE 1,1,NORTH");

    expect(await robot.commandInput.inputValue()).toBe("");
  });

  test("pressing Enter in the command field submits it, same as clicking Run", async () => {
    await robot.runCommandWithEnter("PLACE 4,4,EAST");

    await expect.poll(() => robot.currentState()).toBe("4,4,EAST");
    expect(await robot.commandInput.inputValue()).toBe("");
  });
});
