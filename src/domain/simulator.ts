import { isDirection } from "./direction.ts";
import { Robot } from "./robot.ts";

/**
 * `success` says whether the command took effect (false means it was
 * ignored); `output` carries REPORT's text.
 */
export type CommandResult = {
  readonly success: boolean;
  readonly output?: string | undefined;
};

const PLACE_PATTERN = /^PLACE\s+(-?\d+)\s*,\s*(-?\d+)\s*,\s*([A-Z]+)$/;

/**
 * Parses a raw command line and drives the robot, returning both whether the
 * command took effect and any `REPORT` output.
 */
export class Simulator {
  readonly #robot: Robot;

  constructor(robot: Robot = new Robot()) {
    this.#robot = robot;
  }

  execute(line: string): CommandResult {
    const command = line.trim();
    switch (command) {
      case "MOVE":
        return { success: this.#robot.move() };
      case "LEFT":
        return { success: this.#robot.left() };
      case "RIGHT":
        return { success: this.#robot.right() };
      case "REPORT": {
        const output = this.#robot.report();
        return { success: output !== undefined, output };
      }
    }
    const match = PLACE_PATTERN.exec(command);
    if (!match) return { success: false };
    const [, x, y, facing] = match;
    if (facing === undefined || !isDirection(facing)) return { success: false };
    return { success: this.#robot.place(Number(x), Number(y), facing) };
  }

  get robot(): Robot {
    return this.#robot;
  }
}
