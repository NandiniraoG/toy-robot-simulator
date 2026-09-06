/** Default tabletop edge length: the classic 5 x 5 grid. */
export const SIZE = 5;

/**
 * Owns the grid boundary and answers whether a coordinate is on it. Nothing
 * else needs to know how big the table is.
 */
export class Table {
  constructor(readonly size: number = SIZE) {}

  contains(x: number, y: number): boolean {
    return (
      Number.isSafeInteger(x) &&
      Number.isSafeInteger(y) &&
      x >= 0 &&
      y >= 0 &&
      x < this.size &&
      y < this.size
    );
  }
}
