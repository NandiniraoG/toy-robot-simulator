/** Default tabletop edge length: the classic 5 x 5 grid. */
export const SIZE = 5;

/**
 * Owns the grid boundary and answers whether a coordinate is on it. Nothing
 * else needs to know how big the table is.
 *
 * `size` is held in a genuinely private field rather than a `readonly`
 * property: `readonly` is erased at compile time, so it would leave the
 * boundary writable from plain JavaScript (`table.size = 100`) and let
 * outside code enlarge the world the robot is checked against.
 */
export class Table {
  readonly #size: number;

  constructor(size: number = SIZE) {
    if (!Number.isSafeInteger(size) || size <= 0) {
      throw new RangeError(`Table size must be a positive integer, got ${size}`);
    }
    this.#size = size;
  }

  get size(): number {
    return this.#size;
  }

  contains(x: number, y: number): boolean {
    return (
      Number.isSafeInteger(x) &&
      Number.isSafeInteger(y) &&
      x >= 0 &&
      y >= 0 &&
      x < this.#size &&
      y < this.#size
    );
  }
}
