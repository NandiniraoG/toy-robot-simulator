import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page.ts";
import {
  CASE_INSENSITIVITY_START,
  CLICK_PLACEMENT,
  INVALID_INPUT,
  OFFICIAL_EXAMPLES,
  ROTATION_START,
  TABLE_EDGES,
} from "../testData/toy-robot.testdata.ts";

test.describe("Toy Robot", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("0.places the robot by clicking a cell", async () => {
    expect(await robot.isRobotMarkerVisible()).toBe(false);

    const { x, y, facing } = CLICK_PLACEMENT;
    await robot.placeAt(x, y, facing);

    expect(await robot.isRobotMarkerVisible()).toBe(true);
    await expect.poll(() => robot.currentState()).toBe(`${x},${y},${facing}`);
  });

  test("1.Reproduces the three official spec examples via typed commands", async () => {
    for (const { commands, expected } of OFFICIAL_EXAMPLES) {
      await robot.runCommands(commands);
      expect(await robot.lastLogLine()).toBe(expected);
    }
  });

  test("2.MOVE is blocked at every edge of the table", async () => {
    for (const { x, y, facing } of TABLE_EDGES) {
      await robot.placeAt(x, y, facing);
      await robot.move();
      await expect.poll(() => robot.currentState()).toBe(`${x},${y},${facing}`);
      expect(await robot.lastLogLine()).toBe("(ignored)");
    }
  });

  test("3.LEFT and RIGHT rotate the robot without changing its position", async () => {
    await robot.placeAt(ROTATION_START.x, ROTATION_START.y, ROTATION_START.facing);

    await robot.turnLeft();
    await expect.poll(() => robot.currentState()).toBe("2,2,WEST");

    await robot.turnRight();
    await robot.turnRight();
    await expect.poll(() => robot.currentState()).toBe("2,2,EAST");
  });

  test("4.invalid input is ignored without corrupting robot state", async () => {
    await robot.move(); // MOVE before any PLACE
    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");

    await robot.runCommand("REPORT"); // REPORT before any PLACE
    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe("(not placed yet)");

    const { validPlacement, malformedCommand, outOfBoundsPlace, invalidFacingPlace } =
      INVALID_INPUT;
    const placedState = `${validPlacement.x},${validPlacement.y},${validPlacement.facing}`;

    await robot.placeAt(validPlacement.x, validPlacement.y, validPlacement.facing);
    await robot.runCommand(malformedCommand); // malformed command
    expect(await robot.lastLogLine()).toBe("(ignored)");

    await robot.runCommand(outOfBoundsPlace);
    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe(placedState);

    await robot.runCommand(invalidFacingPlace);
    expect(await robot.lastLogLine()).toBe("(ignored)");
    await expect.poll(() => robot.currentState()).toBe(placedState);
  });

  test("5.typed commands are case-insensitive", async () => {
    const { x, y, facing } = CASE_INSENSITIVITY_START;
    await robot.placeAt(x, y, facing);

    await robot.runCommand("move");
    await expect.poll(() => robot.currentState()).toBe(`${x},${y + 1},${facing}`);

    await robot.runCommand("report");
    expect(await robot.lastLogLine()).toBe(`${x},${y + 1},${facing}`);
  });
});
