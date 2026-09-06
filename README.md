# Toy Robot Simulator

[![E2E Tests](https://github.com/NandiniraoG/toy-robot-simulator/actions/workflows/e2e.yml/badge.svg)](https://github.com/NandiniraoG/toy-robot-simulator/actions/workflows/e2e.yml)

Browser implementation of the classic 5 x 5 tabletop toy robot exercise.

A toy robot moves on a 5 x 5 unit tabletop. There are no obstructions.
The robot is free to roam the surface but must be prevented from falling
off — any movement that would result in it falling is simply ignored.

## Commands

- `PLACE X,Y,F` — places the robot at `(X, Y)` facing `F` (`NORTH`, `SOUTH`,
  `EAST`, or `WEST`). The first valid command must be a `PLACE`; anything
  before it is ignored. A `PLACE` outside the 5x5 grid is also ignored.
- `MOVE` — moves the robot one unit forward in the direction it's facing.
- `LEFT` / `RIGHT` — rotates the robot 90° without changing its position.
- `REPORT` — announces `X,Y,F` in the on-page status panel and command log.

Any command that isn't a valid `PLACE`/`MOVE`/`LEFT`/`RIGHT`/`REPORT` is
silently ignored, so a well-formed run is never derailed by garbage input.

## Design

Everything lives in a single file, `web/index.html` — no build step, no
bundler, just a static page with an embedded `<script>`:

- `Table` — owns the grid boundary and answers whether a coordinate is on
  it. Nothing else needs to know how big the table is.
- `Robot` — the state machine: current position (or none, before the first
  `PLACE`), and the only thing allowed to change it. Every mutator returns
  whether it actually took effect, so the UI can show "(ignored)" from a
  real success/failure signal.
- `Simulator` — parses a raw command line and drives the robot, returning
  both whether the command took effect and any `REPORT` output.

The rest of the file is DOM wiring: building the 5x5 grid, drawing the
robot marker, and hooking up the buttons/command box/log.

## Run

Open `web/index.html` directly in a browser — no install, no server. Click
a cell to place the robot (choose a facing first), use the MOVE/LEFT/RIGHT/
REPORT buttons, or type a raw command like `PLACE 1,2,EAST` into the command
box.

## Test

```bash
npm install
npm run typecheck  # strict TypeScript check of the Playwright test code
npm run test:e2e   # Playwright suite, driven through web/index.html
```

Test coverage lives entirely in `tests/e2e/specs/toy-robot.spec.ts`, driven
through the real UI in `web/index.html` via a Page Object Model
(`tests/e2e/pages/`). Each test demonstrates a distinct part of the approach
rather than exhaustively re-parametrizing every variant of every case:

1. UI placement — clicking a cell places the robot
2. Correctness against the three official spec examples, via typed commands
3. A boundary case — `MOVE` blocked at every edge of the table
4. Rotation — `LEFT`/`RIGHT`
5. Negative/invalid input — a command before any `PLACE`, a malformed
   command, an out-of-bounds `PLACE`, and an invalid direction word, all
   ignored without corrupting robot state
6. Case-insensitive typed commands

Other Playwright config/reporting details: `playwright.config.ts` runs
Chromium only, retains traces/screenshots/video on failure, and produces an
HTML report (`npm run test:e2e:report`).

## The three official spec examples

- `PLACE 0,0,NORTH` / `MOVE` / `REPORT` → `0,1,NORTH`
- `PLACE 0,0,NORTH` / `LEFT` / `REPORT` → `0,0,WEST`
- `PLACE 1,2,EAST` / `MOVE` / `MOVE` / `LEFT` / `MOVE` / `REPORT` → `3,3,NORTH`
