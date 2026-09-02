export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
type Position = Readonly<{ x: number; y: number; facing: Direction }>;

const LEFT: Record<Direction, Direction> = {
  NORTH: 'WEST', WEST: 'SOUTH', SOUTH: 'EAST', EAST: 'NORTH',
};
const RIGHT: Record<Direction, Direction> = {
  NORTH: 'EAST', EAST: 'SOUTH', SOUTH: 'WEST', WEST: 'NORTH',
};
const STEP: Record<Direction, readonly [number, number]> = {
  NORTH: [0, 1], EAST: [1, 0], SOUTH: [0, -1], WEST: [-1, 0],
};

export function isDirection(value: string): value is Direction {
  return value === 'NORTH' || value === 'EAST' ||
    value === 'SOUTH' || value === 'WEST';
}

export class Table {
  readonly #size: number;

  constructor(size = 5) {
    if (!Number.isSafeInteger(size) || size <= 0) {
      throw new RangeError('Table size must be a positive safe integer.');
    }
    this.#size = size;
  }

  contains(x: number, y: number): boolean {
    return Number.isSafeInteger(x) && Number.isSafeInteger(y) &&
      x >= 0 && y >= 0 && x < this.#size && y < this.#size;
  }
}

export class Robot {
  readonly #table: Table;
  #position: Position | undefined;

  constructor(table = new Table()) {
    this.#table = table;
  }

  place(x: number, y: number, facing: Direction): void {
    // Validate before committing so rejected placements preserve existing state.
    if (this.#table.contains(x, y) && isDirection(facing)) {
      this.#position = { x, y, facing };
    }
  }

  move(): void {
    if (!this.#position) return;
    const { x, y, facing } = this.#position;
    const [dx, dy] = STEP[facing];
    this.place(x + dx, y + dy, facing);
  }

  left(): void {
    if (this.#position) {
      this.#position = { ...this.#position, facing: LEFT[this.#position.facing] };
    }
  }

  right(): void {
    if (this.#position) {
      this.#position = { ...this.#position, facing: RIGHT[this.#position.facing] };
    }
  }

  report(): string | undefined {
    if (!this.#position) return undefined;
    const { x, y, facing } = this.#position;
    return `${x},${y},${facing}`;
  }
}
