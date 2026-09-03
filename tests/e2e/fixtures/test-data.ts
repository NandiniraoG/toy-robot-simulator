/**
 * Test fixtures and data for Toy Robot tests
 */

export interface TestCase {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expected: string;
}

export interface TestStep {
  action: "place" | "move" | "turnLeft" | "turnRight" | "report" | "command";
  params?: {
    x?: number;
    y?: number;
    facing?: "NORTH" | "EAST" | "SOUTH" | "WEST";
    command?: string;
  };
}

export const TEST_CASES: Record<string, TestCase> = {
  NO_PLACEMENT: {
    id: "no-placement",
    name: "No Placement State",
    description: "Robot shows no state until placed",
    steps: [],
    expected: "(not placed yet)",
  },

  BASIC_PLACEMENT: {
    id: "basic-placement",
    name: "Place Robot",
    description: "Places the robot by clicking a cell",
    steps: [
      {
        action: "place",
        params: { x: 0, y: 0, facing: "NORTH" },
      },
    ],
    expected: "0,0,NORTH",
  },

  MOVE_NORTH: {
    id: "move-north",
    name: "Move North",
    description: "MOVE steps the robot one unit NORTH",
    steps: [
      {
        action: "place",
        params: { x: 0, y: 0, facing: "NORTH" },
      },
      {
        action: "move",
      },
    ],
    expected: "0,1,NORTH",
  },

  MOVE_EAST: {
    id: "move-east",
    name: "Move East",
    description: "MOVE steps the robot one unit EAST",
    steps: [
      {
        action: "place",
        params: { x: 0, y: 0, facing: "EAST" },
      },
      {
        action: "move",
      },
    ],
    expected: "1,0,EAST",
  },

  EDGE_BOUNDARY: {
    id: "edge-boundary",
    name: "Edge Boundary",
    description: "MOVE at table edge is blocked",
    steps: [
      {
        action: "place",
        params: { x: 0, y: 4, facing: "NORTH" },
      },
      {
        action: "move",
      },
    ],
    expected: "0,4,NORTH",
  },

  ROTATION: {
    id: "rotation",
    name: "Full Rotation",
    description: "LEFT and RIGHT rotate in place without changing position",
    steps: [
      {
        action: "place",
        params: { x: 2, y: 2, facing: "NORTH" },
      },
      {
        action: "turnLeft",
      },
    ],
    expected: "2,2,WEST",
  },

  COMPLEX_SEQUENCE: {
    id: "complex-sequence",
    name: "Complex Movement Sequence",
    description: "Multiple movements and rotations",
    steps: [
      {
        action: "place",
        params: { x: 1, y: 1, facing: "EAST" },
      },
      {
        action: "move",
      },
      {
        action: "turnRight",
      },
      {
        action: "move",
      },
    ],
    expected: "2,0,SOUTH",
  },

  RAW_COMMAND: {
    id: "raw-command",
    name: "Raw Command Input",
    description: "Executes raw command from text input",
    steps: [
      {
        action: "command",
        params: { command: "PLACE 3,3,NORTH" },
      },
    ],
    expected: "3,3,NORTH",
  },
};

export const TEST_SCENARIOS = {
  placement: [TEST_CASES.NO_PLACEMENT, TEST_CASES.BASIC_PLACEMENT],
  movement: [TEST_CASES.MOVE_NORTH, TEST_CASES.MOVE_EAST],
  boundaries: [TEST_CASES.EDGE_BOUNDARY],
  rotation: [TEST_CASES.ROTATION],
  complex: [TEST_CASES.COMPLEX_SEQUENCE, TEST_CASES.RAW_COMMAND],
};
