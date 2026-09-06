import type { Facing } from "../pages/toy-robot.page.ts";

export type Placement = { x: number; y: number; facing: Facing };

export const CLICK_PLACEMENT: Placement = { x: 2, y: 2, facing: "NORTH" };

export const OFFICIAL_EXAMPLES: Array<{
  name: string;
  commands: string[];
  expected: string;
}> = [
  { name: "example A", commands: ["PLACE 0,0,NORTH", "MOVE", "REPORT"], expected: "0,1,NORTH" },
  { name: "example B", commands: ["PLACE 0,0,NORTH", "LEFT", "REPORT"], expected: "0,0,WEST" },
  {
    name: "example C",
    commands: ["PLACE 1,2,EAST", "MOVE", "MOVE", "LEFT", "MOVE", "REPORT"],
    expected: "3,3,NORTH",
  },
];

export const TABLE_EDGES: Placement[] = [
  { x: 4, y: 4, facing: "NORTH" },
  { x: 4, y: 4, facing: "EAST" },
  { x: 0, y: 0, facing: "SOUTH" },
  { x: 0, y: 0, facing: "WEST" },
];

export const ROTATION_START: Placement = { x: 2, y: 2, facing: "NORTH" };

export const INVALID_INPUT = {
  validPlacement: { x: 1, y: 1, facing: "NORTH" } satisfies Placement,
  malformedCommand: "JUMP",
  outOfBoundsPlace: "PLACE 9,9,NORTH",
  invalidFacingPlace: "PLACE 2,2,UP",
};

export const CASE_INSENSITIVITY_START: Placement = { x: 1, y: 1, facing: "NORTH" };
