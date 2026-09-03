/**
 * Command Input Tests
 * Tests for raw command input and processing
 */

import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";
import { TEST_SCENARIOS } from "../fixtures/test-data";

test.describe("Toy Robot - Command Input Tests", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("switches to commandInput case during raw command execution", async () => {
    robot.switchCase("commandInput");
    expect(robot.getCurrentCase()).toBe("commandInput");

    await robot.runCommand("PLACE 1,1,NORTH");
    await expect.poll(() => robot.currentState()).toBe("1,1,NORTH");
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
    await robot.runCommand("REPORT");

    expect(await robot.lastLogLine()).toBe("3,2,NORTH");
  });

  test("executes complex command sequence", async () => {
    const commands = [
      "PLACE 0,0,NORTH",
      "MOVE",
      "TURN_RIGHT",
      "MOVE",
    ];

    for (const cmd of commands) {
      await robot.runCommand(cmd);
    }

    // Verify final state
    const finalState = await robot.currentState();
    expect(finalState).toMatch(/^\d,\d,(NORTH|EAST|SOUTH|WEST)$/);
  });

  test("handles empty command input gracefully", async () => {
    await robot.placeAt(1, 1, "NORTH");
    const stateBefore = await robot.currentState();

    await robot.runCommand("");

    const stateAfter = await robot.currentState();
    expect(stateAfter).toBe(stateBefore);
  });

  test("clears input field after command submission", async () => {
    await robot.runCommand("PLACE 1,1,NORTH");

    const inputValue = await robot.commandInput.inputValue();
    expect(inputValue).toBe("");
  });
});
