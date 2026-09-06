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

The behaviour is TypeScript under `src/`, compiled to a single browser
bundle. `web/index.html` is markup, styles, and one `<script src>` — it
holds no logic of its own, so the rules exist in exactly one place.

```
src/domain/direction.ts   the four facings + the turn/step lookup tables
src/domain/table.ts       the grid boundary
src/domain/robot.ts       the robot state machine
src/domain/simulator.ts   command-line parsing and dispatch
src/domain/index.ts       barrel re-export, the domain's public surface
src/web/robot-glyph.ts    the robot SVG and its per-facing rotation
src/web/main.ts           DOM wiring; the bundle entry point
web/index.html            markup + styles; loads dist/web/app.js
```

- `Table` — owns the grid boundary and answers whether a coordinate is on
  it. Nothing else needs to know how big the table is.
- `Robot` — the state machine: current position (or none, before the first
  `PLACE`), and the only thing allowed to change it. Every mutator returns
  whether it actually took effect, so the UI can show "(ignored)" from a
  real success/failure signal.
- `Simulator` — parses a raw command line and drives the robot, returning
  both whether the command took effect and any `REPORT` output.

`src/web/main.ts` is only wiring: it builds the 5x5 grid, draws the robot
marker, hooks up the buttons/command box/log, and translates every
interaction into a command line the `Simulator` interprets.

### Why a bundle, and not ES modules

The Playwright suite opens the page over `file://`, and Chromium blocks
`<script type="module">` there (the file origin is `null`, so the module
fetch fails CORS). So `npm run build` bundles `src/web/main.ts` with esbuild
into `dist/web/app.js` as a classic script, which `file://` loads fine. That
keeps "just open the HTML" working with no server, while the source stays
split into real modules.

`dist/` is generated and git-ignored.

## Run

```bash
npm install
npm run build   # bundles src/ -> dist/web/app.js
```

Then open `web/index.html` directly in a browser — no server needed. Click
a cell to place the robot (choose a facing first), use the MOVE/LEFT/RIGHT/
REPORT buttons, or type a raw command like `PLACE 1,2,EAST` into the command
box.

While editing, `npm run build:watch` rebuilds on save; reload the page to
pick the change up.

## Test

```bash
npm ci             # or: npm install
npm run typecheck  # strict TypeScript check of src/ and of the test code
npm run test:e2e   # Playwright suite, driven through web/index.html
```

`npm run test:e2e` needs no separate build step — both Playwright configs
run `npm run build` from `tests/global-setup.ts` before the first page
opens, so `--ui`, `--headed`, `--debug` and `npm run screenshots` all test
the current `src/` too.

`npm run typecheck` runs `tsc` twice: `tsconfig.json` covers the
Node-flavoured test and tooling code, and `tsconfig.app.json` covers the
browser code in `src/` (DOM lib, no Node types).

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
