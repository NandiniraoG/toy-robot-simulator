# Toy Robot Simulator

[![Tests](https://github.com/NandiniraoG/toy-robot-simulator/actions/workflows/e2e.yml/badge.svg)](https://github.com/NandiniraoG/toy-robot-simulator/actions/workflows/e2e.yml)

TypeScript implementation of the classic 5 x 5 tabletop toy robot exercise,
with a command-line front end (commands from a file or stdin) and an
optional browser UI over the same domain code.

A toy robot moves on a 5 x 5 unit tabletop. There are no obstructions.
The robot is free to roam the surface but must be prevented from falling
off — any movement that would result in it falling is simply ignored.

## Commands

- `PLACE X,Y,F` — places the robot at `(X, Y)` facing `F` (`NORTH`, `SOUTH`,
  `EAST`, or `WEST`). The first valid command must be a `PLACE`; anything
  before it is ignored. A `PLACE` outside the 5x5 grid is also ignored.
- `MOVE` — moves the robot one unit forward in the direction it's facing.
- `LEFT` / `RIGHT` — rotates the robot 90° without changing its position.
- `REPORT` — announces `X,Y,F`: on stdout from the CLI, and in the on-page
  status panel and command log in the browser.

Any command that isn't a valid `PLACE`/`MOVE`/`LEFT`/`RIGHT`/`REPORT` is
silently ignored, so a well-formed run is never derailed by garbage input.

## Design

The rules are TypeScript under `src/domain/`, with no knowledge of how they
are driven. Two front ends sit on top: a CLI that reads commands from a file
or stdin, and the browser page.

```
src/domain/direction.ts   the four facings + the turn/step lookup tables
src/domain/table.ts       the grid boundary
src/domain/robot.ts       the robot state machine
src/domain/simulator.ts   command-line parsing and dispatch
src/domain/index.ts       barrel re-export, the domain's public surface

src/cli/main.ts           CLI front end: file or stdin -> stdout
src/web/main.ts           browser front end: DOM wiring
src/web/robot-glyph.ts    the robot SVG and its per-facing rotation
src/web/index.html        markup + styles; loads dist/web/app.js

tests/e2e/testData/       test fixtures: command files + UI test data
```

- `Table` — owns the grid boundary and answers whether a coordinate is on
  it. Nothing else needs to know how big the table is.
- `Robot` — the state machine: current position (or none, before the first
  `PLACE`), and the only thing allowed to change it. Every mutator returns
  whether it actually took effect, so a front end can report "ignored" from
  a real success/failure signal.
- `Simulator` — normalises and parses a raw command line and drives the
  robot, returning both whether the command took effect and any `REPORT`
  output.

Neither front end contains a rule. `src/cli/main.ts` splits input into lines
and prints `REPORT` output; `src/web/main.ts` builds the 5x5 grid, draws the
robot marker, and turns clicks and keystrokes into command lines. Both hand
every line to the same `Simulator`.

### Encapsulation

`Robot` and `Table` keep their state in `#private` fields, and `Robot`
exposes it only as a **frozen copy**:

```ts
get position(): Position | undefined {
  if (!this.#position) return undefined;
  return Object.freeze({ ...this.#position });
}
```

TypeScript's `readonly` is erased at compile time, so returning the live
object would let any caller do `robot.position.x = 99` and move the robot
without going through a command. Copying makes the robot the only writer of
its own state; freezing turns an attempted write into a `TypeError` instead
of a silent no-op. `Table` holds its size the same way, so the boundary the
robot is checked against cannot be widened from outside. Both properties are
covered by tests in `tests/unit/domain.spec.ts`.

### Why a bundle, and not ES modules

The Playwright suite opens the page over `file://`, and Chromium blocks
`<script type="module">` there (the file origin is `null`, so the module
fetch fails CORS). So `npm run build` bundles `src/web/main.ts` with esbuild
into `dist/web/app.js` as a classic script, which `file://` loads fine. That
keeps "just open the HTML" working with no server, while the source stays
split into real modules.

`dist/` is generated and git-ignored.

## Run

Requires **Node.js 22** (the version CI runs).

```bash
npm ci
npm run build     # -> dist/cli/main.js and dist/web/app.js
```

### Command line

Pass a file, or pipe commands in on standard input:

```bash
npm start -- tests/e2e/testData/example-a.txt          # 0,1,NORTH
node dist/cli/main.js tests/e2e/testData/example-c.txt  # 3,3,NORTH
node dist/cli/main.js < tests/e2e/testData/example-b.txt
printf 'PLACE 0,0,NORTH\nMOVE\nREPORT\n' | node dist/cli/main.js
```

Only `REPORT` writes to stdout, one `X,Y,F` line per command. Commands are
case-insensitive; blank lines and `#` comments are skipped; anything invalid
is ignored rather than treated as an error, so one bad line never derails
the rest of the run. A missing input file exits `1` with a message on
stderr.

### Browser

Open `src/web/index.html` directly — no server needed. Click a cell to place the
robot (choose a facing first), use the MOVE/LEFT/RIGHT/REPORT buttons, or
type a raw command like `PLACE 1,2,EAST` into the command box.

While editing, `npm run build:watch` rebuilds the page bundle on save.

## Test

Requires **Node.js 22** (the version CI runs; anything from 20.11 up should
work). From a clean checkout:

```bash
npm ci
npx playwright install chromium   # browser for the e2e suite
npm run typecheck                 # strict check of every source and test file
npm test                          # unit + CLI suite, then the browser suite
```

The Chromium download is only needed for the browser suite —
`npm run test:unit` runs the domain and CLI tests with no browser at all.

Run each suite on its own with:

```bash
npm run test:unit  # 50 Node tests: the domain classes and the CLI
npm run test:e2e   # 6 Playwright tests through src/web/index.html
```

Neither needs a separate build step — every Playwright config runs
`npm run build` from `tests/global-setup.ts` first, so `--ui`, `--headed`,
`--debug` and `npm run screenshots` all test the current `src/` too.

`npm run typecheck` runs `tsc` twice: `tsconfig.json` covers the
Node-flavoured code (the CLI, the suites, the tooling), and
`tsconfig.app.json` covers the browser code (DOM lib, no Node types) so a
stray `node:fs` import in `src/web` fails the build.

### Test data

`tests/e2e/testData/` holds the command files the CLI suite runs, each with
its expected output as a header comment:

| File | Covers |
|---|---|
| `example-a.txt`, `example-b.txt`, `example-c.txt` | the three official spec examples |
| `edge-cases.txt` | commands discarded before the first `PLACE`, blocked moves at the edges and in a corner, **valid movement still working after a blocked move**, full-circle rotation, re-placing mid-run |
| `invalid-input.txt` | malformed commands, out-of-bounds and non-integer `PLACE`, bad direction words, lower-case input |

### What each suite is for

`tests/unit/domain.spec.ts` asserts the rules directly against `Simulator`,
`Robot` and `Table` — including the spec's requirement that a prevented fall
must still leave *further valid movement commands* working, and that robot
state cannot be rewritten from outside. `tests/unit/cli.spec.ts` runs the
built CLI as a subprocess against `tests/e2e/testData/`, both ways round (file argument and
piped stdin).

`tests/e2e/specs/toy-robot.spec.ts` covers the browser front end through the
real UI via a Page Object Model (`tests/e2e/pages/`). Each test demonstrates
a distinct part of the approach rather than exhaustively re-parametrizing
every variant of every case:

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
