import { expect, test } from "@playwright/test";
import { Robot, Simulator, Table } from "../../src/domain/index.ts";

/**
 * Unit coverage for the rules themselves. The Playwright UI suite proves the
 * page is wired up correctly; these prove the rules are right, at a level the
 * DOM cannot reach — notably that a blocked MOVE leaves the robot able to
 * carry on, and that the robot's state cannot be rewritten from outside.
 */

/** Runs a script of command lines and returns everything REPORT printed. */
function run(...commands: string[]): string[] {
  const simulator = new Simulator(new Robot(new Table()));
  const output: string[] = [];
  for (const command of commands) {
    const { output: line } = simulator.execute(command);
    if (line !== undefined) output.push(line);
  }
  return output;
}

test.describe("official spec examples", () => {
  test("a) PLACE 0,0,NORTH / MOVE / REPORT", () => {
    expect(run("PLACE 0,0,NORTH", "MOVE", "REPORT")).toEqual(["0,1,NORTH"]);
  });

  test("b) PLACE 0,0,NORTH / LEFT / REPORT", () => {
    expect(run("PLACE 0,0,NORTH", "LEFT", "REPORT")).toEqual(["0,0,WEST"]);
  });

  test("c) PLACE 1,2,EAST / MOVE / MOVE / LEFT / MOVE / REPORT", () => {
    expect(run("PLACE 1,2,EAST", "MOVE", "MOVE", "LEFT", "MOVE", "REPORT")).toEqual([
      "3,3,NORTH",
    ]);
  });
});

test.describe("the robot is discarded until a valid PLACE", () => {
  test("MOVE, LEFT, RIGHT and REPORT before any PLACE are all ignored", () => {
    expect(run("MOVE", "LEFT", "RIGHT", "REPORT")).toEqual([]);
  });

  test("an off-table PLACE does not activate the robot", () => {
    expect(run("PLACE 5,5,NORTH", "MOVE", "REPORT")).toEqual([]);
  });

  test("a later valid PLACE still works after a refused one", () => {
    expect(run("PLACE 9,9,NORTH", "REPORT", "PLACE 1,1,SOUTH", "REPORT")).toEqual([
      "1,1,SOUTH",
    ]);
  });

  test.describe("initial placement is bounds-checked", () => {
    for (const place of [
      "PLACE -1,0,NORTH",
      "PLACE 0,-1,NORTH",
      "PLACE 5,0,NORTH",
      "PLACE 0,5,NORTH",
      "PLACE 2,2,UP",
      "PLACE 1.5,2,NORTH",
    ]) {
      test(`${place} is refused`, () => {
        expect(run(place, "REPORT")).toEqual([]);
      });
    }
  });
});

test.describe("MOVE", () => {
  for (const [place, expected] of [
    ["PLACE 0,0,NORTH", "0,1,NORTH"],
    ["PLACE 0,0,EAST", "1,0,EAST"],
    ["PLACE 4,4,SOUTH", "4,3,SOUTH"],
    ["PLACE 4,4,WEST", "3,4,WEST"],
  ] as const) {
    test(`${place} advances one unit`, () => {
      expect(run(place, "MOVE", "REPORT")).toEqual([expected]);
    });
  }

  for (const [place, expected] of [
    ["PLACE 0,4,NORTH", "0,4,NORTH"],
    ["PLACE 4,0,EAST", "4,0,EAST"],
    ["PLACE 0,0,SOUTH", "0,0,SOUTH"],
    ["PLACE 0,0,WEST", "0,0,WEST"],
  ] as const) {
    test(`${place} is blocked at the edge`, () => {
      expect(run(place, "MOVE", "REPORT")).toEqual([expected]);
    });
  }
});

// The spec is explicit that preventing a fall must not disable the robot:
// "Any movement that would result in the robot falling from the table must be
// prevented, however further valid movement commands must still be allowed."
test.describe("a blocked MOVE still allows further valid movement", () => {
  test("turning away from the edge and moving works", () => {
    expect(run("PLACE 2,4,NORTH", "MOVE", "REPORT", "RIGHT", "MOVE", "REPORT")).toEqual([
      "2,4,NORTH",
      "3,4,EAST",
    ]);
  });

  test("a corner blocked in two directions can still be escaped", () => {
    expect(
      run("PLACE 0,0,SOUTH", "MOVE", "REPORT", "RIGHT", "RIGHT", "MOVE", "REPORT"),
    ).toEqual(["0,0,SOUTH", "0,1,NORTH"]);
  });

  test("repeated blocked MOVEs neither advance nor corrupt the robot", () => {
    expect(
      run(
        "PLACE 4,4,EAST",
        "MOVE",
        "MOVE",
        "MOVE",
        "MOVE",
        "MOVE",
        "REPORT",
        "RIGHT",
        "MOVE",
        "REPORT",
      ),
    ).toEqual(["4,4,EAST", "4,3,SOUTH"]);
  });
});

test.describe("LEFT and RIGHT rotate without moving", () => {
  test("LEFT from NORTH faces WEST", () => {
    expect(run("PLACE 2,2,NORTH", "LEFT", "REPORT")).toEqual(["2,2,WEST"]);
  });

  test("RIGHT from NORTH faces EAST", () => {
    expect(run("PLACE 2,2,NORTH", "RIGHT", "REPORT")).toEqual(["2,2,EAST"]);
  });

  test("four LEFTs return to the starting facing", () => {
    expect(run("PLACE 2,2,NORTH", "LEFT", "LEFT", "LEFT", "LEFT", "REPORT")).toEqual([
      "2,2,NORTH",
    ]);
  });

  test("four RIGHTs return to the starting facing", () => {
    expect(run("PLACE 2,2,NORTH", "RIGHT", "RIGHT", "RIGHT", "RIGHT", "REPORT")).toEqual([
      "2,2,NORTH",
    ]);
  });
});

test.describe("input handling", () => {
  test("commands are case-insensitive", () => {
    expect(run("place 0,0,north", "move", "report")).toEqual(["0,1,NORTH"]);
  });

  test("surrounding whitespace and spaces around commas are tolerated", () => {
    expect(run("  PLACE 1 , 2 , EAST  ", "  REPORT  ")).toEqual(["1,2,EAST"]);
  });

  test("garbage lines are ignored without derailing the run", () => {
    expect(
      run("PLACE 1,1,NORTH", "JUMP", "FLY 1,2,NORTH", "PLACE", "PLACE 1,2", "REPORT"),
    ).toEqual(["1,1,NORTH"]);
  });

  test("re-placing an already placed robot is allowed", () => {
    expect(run("PLACE 1,1,NORTH", "PLACE 3,3,SOUTH", "REPORT")).toEqual(["3,3,SOUTH"]);
  });
});

test.describe("encapsulation", () => {
  test("the position snapshot cannot be used to rewrite robot state", () => {
    const robot = new Robot(new Table());
    const simulator = new Simulator(robot);
    simulator.execute("PLACE 1,1,NORTH");

    const snapshot = robot.position;
    expect(snapshot).toEqual({ x: 1, y: 1, facing: "NORTH" });

    // Strict mode (every ES module) turns a write to a frozen object into a
    // TypeError rather than a silent no-op.
    expect(() => {
      (snapshot as { x: number }).x = 99;
    }).toThrow(TypeError);

    expect(simulator.execute("REPORT").output).toBe("1,1,NORTH");
  });

  test("each read returns an independent snapshot", () => {
    const robot = new Robot(new Table());
    robot.place(2, 2, "NORTH");
    const first = robot.position;
    robot.right();
    expect(first).toEqual({ x: 2, y: 2, facing: "NORTH" });
    expect(robot.position).toEqual({ x: 2, y: 2, facing: "EAST" });
  });

  test("the robot exposes no writable own properties", () => {
    const robot = new Robot(new Table());
    robot.place(0, 0, "NORTH");
    expect(Object.keys(robot)).toEqual([]);
    expect(Object.getOwnPropertyNames(robot)).toEqual([]);
  });

  test("the table boundary cannot be widened from outside", () => {
    const table = new Table();
    expect(table.size).toBe(5);
    expect(() => {
      (table as { size: number }).size = 100;
    }).toThrow(TypeError);
    expect(table.contains(50, 50)).toBe(false);
    expect(new Robot(table).place(50, 50, "NORTH")).toBe(false);
  });

  test("Table rejects a nonsensical size instead of silently accepting it", () => {
    expect(() => new Table(0)).toThrow(RangeError);
    expect(() => new Table(-1)).toThrow(RangeError);
    expect(() => new Table(2.5)).toThrow(RangeError);
  });
});
