import { describe, expect, it } from "vitest";
import { CommandParser, Tabletop, ToyRobot, ToyRobotSimulator } from "../src/simulator.ts";

describe("ToyRobotSimulator", () => {
  it("runs example A", () => {
    const simulator = new ToyRobotSimulator();

    expect(
      simulator.run(`PLACE 0,0,NORTH
MOVE
REPORT`),
    ).toEqual(["0,1,NORTH"]);
  });

  it("runs example B", () => {
    const simulator = new ToyRobotSimulator();

    expect(
      simulator.run(`PLACE 0,0,NORTH
LEFT
REPORT`),
    ).toEqual(["0,0,WEST"]);
  });

  it("runs example C", () => {
    const simulator = new ToyRobotSimulator();

    expect(
      simulator.run(`PLACE 1,2,EAST
MOVE
MOVE
LEFT
MOVE
REPORT`),
    ).toEqual(["3,3,NORTH"]);
  });

  it("ignores commands before the first valid PLACE", () => {
    const simulator = new ToyRobotSimulator();

    expect(
      simulator.run(`MOVE
LEFT
REPORT
PLACE 2,2,WEST
REPORT`),
    ).toEqual(["2,2,WEST"]);
  });

  it("ignores invalid PLACE commands and keeps accepting later valid commands", () => {
    const simulator = new ToyRobotSimulator();

    expect(
      simulator.run(`PLACE 5,0,NORTH
PLACE -1,0,EAST
PLACE 4,4,NORTH
MOVE
RIGHT
MOVE
REPORT`),
    ).toEqual(["4,4,EAST"]);
  });

  it("allows another valid PLACE command to reposition the robot", () => {
    const simulator = new ToyRobotSimulator();

    expect(
      simulator.run(`PLACE 0,0,NORTH
MOVE
PLACE 4,4,SOUTH
MOVE
REPORT`),
    ).toEqual(["4,3,SOUTH"]);
  });

  it("ignores malformed commands", () => {
    const simulator = new ToyRobotSimulator();

    expect(
      simulator.run(`PLACE 1,1,NORTH
JUMP
PLACE 1,1,UP
MOVE 2
RIGHT
REPORT`),
    ).toEqual(["1,1,EAST"]);
  });
});

describe("ToyRobot", () => {
  it("does not move beyond the tabletop bounds", () => {
    const robot = new ToyRobot(new Tabletop(5, 5));

    robot.place({ x: 0, y: 0, facing: "SOUTH" });
    robot.move();

    expect(robot.report()).toBe("0,0,SOUTH");
  });
});

describe("CommandParser", () => {
  it("parses commands case-insensitively and tolerates spaces around PLACE values", () => {
    const parser = new CommandParser();

    expect(parser.parse(" place 3, 4, west ")).toEqual({
      type: "PLACE",
      x: 3,
      y: 4,
      facing: "WEST",
    });
  });
});
