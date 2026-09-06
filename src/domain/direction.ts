/**
 * The four compass directions the robot can face, and the lookup tables that
 * define what turning and moving mean. Everything here is pure data — no
 * knowledge of the table, the robot, or the DOM.
 */
export const DIRECTIONS = ["NORTH", "EAST", "SOUTH", "WEST"] as const;

export type Direction = (typeof DIRECTIONS)[number];

export const LEFT_OF: Record<Direction, Direction> = {
  NORTH: "WEST",
  WEST: "SOUTH",
  SOUTH: "EAST",
  EAST: "NORTH",
};

export const RIGHT_OF: Record<Direction, Direction> = {
  NORTH: "EAST",
  EAST: "SOUTH",
  SOUTH: "WEST",
  WEST: "NORTH",
};

/** One unit of travel as `[dx, dy]`, with NORTH being +y. */
export const STEP: Record<Direction, readonly [number, number]> = {
  NORTH: [0, 1],
  EAST: [1, 0],
  SOUTH: [0, -1],
  WEST: [-1, 0],
};

export function isDirection(value: string): value is Direction {
  return (DIRECTIONS as readonly string[]).includes(value);
}
