# Toy Robot Simulator

TypeScript implementation of the toy robot simulator exercise: a robot moves
on a 5x5 tabletop and must never be allowed to fall off, in response to
`PLACE`, `MOVE`, `LEFT`, `RIGHT`, and `REPORT` commands.

## Design

The problem is split into four small, single-responsibility classes in
[`src/simulator.ts`](src/simulator.ts):

- **`Tabletop`** — owns the surface dimensions and the one rule that matters
  for safety: whether a given `(x, y)` is on the table (`contains`).
- **`ToyRobot`** — owns the robot's own state (position + facing), which is
  kept private (`placement`) and only ever mutated through methods that
  consult the `Tabletop` first. It has no idea how commands are parsed.
- **`CommandParser`** — turns one line of raw text into a typed `Command`
  (or `null` if it isn't recognised), completely decoupled from execution.
- **`ToyRobotSimulator`** — composes a parser and a robot, and is the only
  class client code (the CLI, or tests) needs to talk to.

This separation means the "don't fall off the table" rule lives in exactly
one place (`Tabletop.contains`), used by both `place()` and `move()`, so a
placement and a move can never disagree about what's legal.

Invalid input is never thrown as an error — an unrecognised command, a
malformed `PLACE`, or a `PLACE`/`MOVE` that would take the robot off the
table is simply ignored, and the simulator keeps processing the rest of the
input, per the spec.

## Run

From a command file:

```sh
npm install
npm run toy-robot -- examples/example-c.txt
```

From standard input:

```sh
cat examples/example-a.txt | npm run toy-robot
```

## Test

```sh
npm install
npm test
```

9 tests in [`tests/toy-robot.test.ts`](tests/toy-robot.test.ts) cover:

- the three official worked examples (a, b, c)
- commands before the first valid `PLACE` being discarded
- an invalid `PLACE` (off-table) being ignored while a later valid `PLACE`
  still works
- a second, valid `PLACE` mid-run repositioning the robot
- malformed/unknown commands (`JUMP`, `PLACE 1,1,UP`, `MOVE 2`) being ignored
- case-insensitive parsing and tolerance for extra spacing
- a unit-level check that `ToyRobot` itself refuses to move off the table

## Example data

- [`examples/example-a.txt`](examples/example-a.txt) → `0,1,NORTH`
- [`examples/example-b.txt`](examples/example-b.txt) → `0,0,WEST`
- [`examples/example-c.txt`](examples/example-c.txt) → `3,3,NORTH`
- [`examples/boundary-and-recovery.txt`](examples/boundary-and-recovery.txt) —
  covers ignoring commands before a `PLACE`, an out-of-bounds `PLACE`, a
  `MOVE` blocked at the table edge, and recovering with a fresh `PLACE`
