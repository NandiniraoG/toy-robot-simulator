import { isDirection, LEFT_OF, RIGHT_OF, STEP, type Direction } from "./direction.ts";
import { Table } from "./table.ts";

export type Position = {
  readonly x: number;
  readonly y: number;
  readonly facing: Direction;
};

/**
 * The state machine: current position (or none, before the first `PLACE`), and
 * the only thing allowed to change it.
 */
export class Robot {
  readonly #table: Table;
  #position: Position | undefined;

  constructor(table: Table = new Table()) {
    this.#table = table;
  }

  // Every mutator below returns whether it actually took effect, so the UI
  // can report "ignored" from a real success/failure signal instead of
  // diffing report strings (which falsely flags a same-spot re-PLACE as
  // ignored even though it succeeded).
  place(x: number, y: number, facing: string): boolean {
    if (this.#table.contains(x, y) && isDirection(facing)) {
      this.#position = { x, y, facing };
      return true;
    }
    return false;
  }

  move(): boolean {
    if (!this.#position) return false;
    const { x, y, facing } = this.#position;
    const [dx, dy] = STEP[facing];
    return this.place(x + dx, y + dy, facing);
  }

  left(): boolean {
    if (!this.#position) return false;
    this.#position = { ...this.#position, facing: LEFT_OF[this.#position.facing] };
    return true;
  }

  right(): boolean {
    if (!this.#position) return false;
    this.#position = { ...this.#position, facing: RIGHT_OF[this.#position.facing] };
    return true;
  }

  report(): string | undefined {
    if (!this.#position) return undefined;
    const { x, y, facing } = this.#position;
    return `${x},${y},${facing}`;
  }

  get position(): Position | undefined {
    return this.#position;
  }
}
