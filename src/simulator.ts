export const directions = ["NORTH", "EAST", "SOUTH", "WEST"] as const;

export type Direction = (typeof directions)[number];

export type Command =
  | { type: "PLACE"; x: number; y: number; facing: Direction }
  | { type: "MOVE" }
  | { type: "LEFT" }
  | { type: "RIGHT" }
  | { type: "REPORT" };

export type RobotPlacement = {
  x: number;
  y: number;
  facing: Direction;
};

export class Tabletop {
  private readonly width: number;
  private readonly height: number;

  constructor(width = 5, height = 5) {
    if (width <= 0 || height <= 0) {
      throw new Error("Tabletop dimensions must be positive.");
    }

    this.width = width;
    this.height = height;
  }

  contains(x: number, y: number): boolean {
    return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
}

export class CommandParser {
  parse(rawCommand: string): Command | null {
    const command = rawCommand.trim();

    if (!command) {
      return null;
    }

    const placeMatch = command.match(/^PLACE\s+(-?\d+)\s*,\s*(-?\d+)\s*,\s*(NORTH|EAST|SOUTH|WEST)$/i);

    if (placeMatch) {
      return {
        type: "PLACE",
        x: Number(placeMatch[1]),
        y: Number(placeMatch[2]),
        facing: placeMatch[3].toUpperCase() as Direction,
      };
    }

    const normalizedCommand = command.toUpperCase();

    if (["MOVE", "LEFT", "RIGHT", "REPORT"].includes(normalizedCommand)) {
      return { type: normalizedCommand as "MOVE" | "LEFT" | "RIGHT" | "REPORT" };
    }

    return null;
  }
}

export class ToyRobot {
  private placement: RobotPlacement | null = null;
  private readonly tabletop: Tabletop;

  constructor(tabletop = new Tabletop()) {
    this.tabletop = tabletop;
  }

  place(placement: RobotPlacement): boolean {
    if (!this.tabletop.contains(placement.x, placement.y)) {
      return false;
    }

    this.placement = { ...placement };
    return true;
  }

  move(): void {
    if (!this.placement) {
      return;
    }

    const next = this.nextPlacement();

    if (this.tabletop.contains(next.x, next.y)) {
      this.placement = next;
    }
  }

  turnLeft(): void {
    this.rotate(-1);
  }

  turnRight(): void {
    this.rotate(1);
  }

  report(): string | null {
    if (!this.placement) {
      return null;
    }

    return `${this.placement.x},${this.placement.y},${this.placement.facing}`;
  }

  private rotate(step: -1 | 1): void {
    if (!this.placement) {
      return;
    }

    const currentIndex = directions.indexOf(this.placement.facing);
    const nextIndex = (currentIndex + step + directions.length) % directions.length;
    this.placement = {
      ...this.placement,
      facing: directions[nextIndex],
    };
  }

  private nextPlacement(): RobotPlacement {
    if (!this.placement) {
      throw new Error("Robot must be placed before calculating its next placement.");
    }

    const movementByDirection: Record<Direction, Pick<RobotPlacement, "x" | "y">> = {
      NORTH: { x: 0, y: 1 },
      EAST: { x: 1, y: 0 },
      SOUTH: { x: 0, y: -1 },
      WEST: { x: -1, y: 0 },
    };
    const movement = movementByDirection[this.placement.facing];

    return {
      ...this.placement,
      x: this.placement.x + movement.x,
      y: this.placement.y + movement.y,
    };
  }
}

export class ToyRobotSimulator {
  private readonly parser = new CommandParser();
  private readonly robot: ToyRobot;

  constructor(tabletop = new Tabletop()) {
    this.robot = new ToyRobot(tabletop);
  }

  run(input: string): string[] {
    return input
      .split(/\r?\n/)
      .map((line) => this.execute(line))
      .filter((output): output is string => output !== null);
  }

  execute(rawCommand: string): string | null {
    const command = this.parser.parse(rawCommand);

    if (!command) {
      return null;
    }

    switch (command.type) {
      case "PLACE":
        this.robot.place({
          x: command.x,
          y: command.y,
          facing: command.facing,
        });
        return null;
      case "MOVE":
        this.robot.move();
        return null;
      case "LEFT":
        this.robot.turnLeft();
        return null;
      case "RIGHT":
        this.robot.turnRight();
        return null;
      case "REPORT":
        return this.robot.report();
    }
  }
}
