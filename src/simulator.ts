import { isDirection, Robot } from './robot.ts';

/** Executes one command per line; only REPORT produces output. */
export class Simulator {
  readonly #robot: Robot;

  constructor(robot = new Robot()) {
    this.#robot = robot;
  }

  execute(line: string): string | undefined {
    const command = line.trim();
    switch (command) {
      case 'MOVE': this.#robot.move(); return;
      case 'LEFT': this.#robot.left(); return;
      case 'RIGHT': this.#robot.right(); return;
      case 'REPORT': return this.#robot.report();
    }

    const match = /^PLACE\s+(-?\d+)\s*,\s*(-?\d+)\s*,\s*([A-Z]+)$/.exec(command);
    if (!match) return;
    const [, x, y, facing] = match;
    if (facing !== undefined && isDirection(facing)) {
      this.#robot.place(Number(x), Number(y), facing);
    }
  }
}
