# Toy Robot Simulator

TypeScript implementation of the classic 5 x 5 tabletop toy robot exercise.

A toy robot moves on a 5 x 5 unit tabletop. There are no obstructions.
The robot is free to roam the surface but must be prevented from falling
off — any movement that would result in it falling is simply ignored.

## Commands

- `PLACE X,Y,F` — places the robot at `(X, Y)` facing `F` (`NORTH`, `SOUTH`,
  `EAST`, or `WEST`). The first valid command must be a `PLACE`; anything
  before it is ignored. A `PLACE` outside the 5x5 grid is also ignored.
- `MOVE` — moves the robot one unit forward in the direction it's facing.
- `LEFT` / `RIGHT` — rotates the robot 90° without changing its position.
- `REPORT` — announces `X,Y,F` (via stdout).

Any command that isn't a valid `PLACE`/`MOVE`/`LEFT`/`RIGHT`/`REPORT` is
silently ignored, so a well-formed run is never derailed by garbage input.

## Design

- `Tabletop` — owns the grid boundary and answers whether a coordinate is
  on it. Nothing else needs to know how big the table is.
- `CommandParser` — turns a raw line of text into a typed `Command` (a
  discriminated union) or `null`. Parsing is entirely separate from what a
  command *does*.
- `ToyRobot` — the state machine: current placement (or none, before the
  first `PLACE`), and the only thing allowed to change it. Placement is
  copied rather than mutated in place, so nothing outside the class can
  hold a stale reference and corrupt it.
- `ToyRobotSimulator` — wires a parser and a robot together and runs a
  whole script of commands, collecting `REPORT` output.

## Install

```bash
npm install
```

## Run

From a command file:

```bash
npm start -- examples/example-c.txt
```

From standard input:

```bash
cat examples/example-a.txt | npm start
```

(On Windows PowerShell: `Get-Content examples/example-a.txt | npm start`.)

## Test

```bash
npm test        # unit tests (vitest)
npm run typecheck  # strict TypeScript check, no emit
```

`npm test` runs 23 unit tests against the domain classes described above:

- the three official examples (`PLACE`/`MOVE`/`LEFT`/`RIGHT`/`REPORT`)
- commands issued before the first valid `PLACE` (ignored)
- an invalid `PLACE` followed by a later valid one repositioning the robot
- malformed and case-insensitive command parsing
- `MOVE` blocked at all four tabletop edges — `0,0` facing `SOUTH`/`WEST` and
  `4,4` facing `NORTH`/`EAST` — via a parameterised test per edge
- rotation: four consecutive `LEFT` (or `RIGHT`) commands returning to the
  original facing, plus every individual `LEFT`/`RIGHT` compass transition
- a custom, smaller `Tabletop` size honoured end-to-end through the simulator

## Examples

- `examples/example-a.txt` outputs `0,1,NORTH`
- `examples/example-b.txt` outputs `0,0,WEST`
- `examples/example-c.txt` outputs `3,3,NORTH`
- `examples/boundary-and-recovery.txt` covers invalid placement, blocked
  moves at the table edge, and recovering with a fresh `PLACE`
