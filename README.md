# Toy Robot Simulator

A TypeScript command-line application for a robot on a 5 × 5 tabletop.

## Requirements and quick start

Use Node.js 22.18+ (or Node.js 24+), with native TypeScript execution.
No installation or build step is needed to run the application or tests.

From this directory:

```sh
node src/cli.ts examples/examples.txt
node --test test/*.test.mjs
```

Example output:

```text
0,1,NORTH
0,0,WEST
3,3,NORTH
```

To read standard input, run `node src/cli.ts`, enter one command per line,
and end input using Ctrl+D on macOS/Linux or Ctrl+Z then Enter on Windows.
REPORT prints immediately. Shell redirection also works:

```sh
node src/cli.ts < examples/edge-cases.txt
```

Equivalent npm shortcuts are `npm start -- examples/examples.txt` and `npm test`.
Optional static checking requires the development dependencies:

```sh
npm install
npm run typecheck
```

Native execution strips types; it does not perform static checking.

## Commands and decisions

- `PLACE X,Y,F`: places or repositions the robot. Coordinates must be integers
  from 0 through 4, and F must be NORTH, SOUTH, EAST, or WEST.
- `MOVE`: advances one cell if the destination is inside the table.
- `LEFT` / `RIGHT`: rotates 90 degrees without changing position.
- `REPORT`: prints `X,Y,F`, followed by a newline.
- Before a valid PLACE, all other commands produce no effect or output.
- An invalid PLACE preserves any previously valid position and direction.
- A rejected MOVE preserves state; later commands still execute normally.
- Commands are uppercase and occupy one line each. Leading/trailing whitespace
  and spaces around commas are accepted. Blank, unknown, and malformed commands
  are silently ignored. Decimals and extra command arguments are rejected.
- File/usage errors go to stderr and return exit code 1. Successful input
  processing returns 0, even when individual commands were ignored.

The origin is the southwest cell. NORTH increases Y; EAST increases X.

## Structure

```text
src/robot.ts          Table bounds, direction types, and Robot behavior
src/simulator.ts      Text command parsing and dispatch
src/cli.ts            Streaming file/stdin input and stdout/stderr output
test/robot.test.mjs   Domain and command-processing tests
test/cli.test.mjs     End-to-end command-line tests
examples/            Inputs and exact expected output files
```

## Design and interview discussion

**Encapsulation:** Robot keeps its position private using JavaScript private
fields. The position is either absent or a complete valid state. Public methods
are the only way to move or place it; callers cannot mutate coordinates directly.

**Composition:** Robot receives a Table, and Simulator receives a Robot, with
sensible defaults. This keeps boundaries separate from command parsing and
allows a differently sized square table without changing movement logic.

**Single responsibilities:** Table answers whether a coordinate is valid;
Robot applies domain rules; Simulator interprets text; the CLI handles I/O.
The domain never reads files or prints, which makes it easy to test directly.

**Validate before mutation:** PLACE commits only a valid state. MOVE calculates
its candidate position and uses the same placement validation. This ensures
both entry paths enforce the same boundary rule.

**Direction handling:** Typed lookup tables express movement and rotation
explicitly. A string union restricts valid directions at compile time; the
parser also validates untrusted strings at runtime.

**Pattern choice:** Composition and a small dispatcher are sufficient for five
commands. Separate command classes, a factory, or inheritance would add machinery
without helping the current requirements. Command objects could become useful
if undo/redo or queued commands were introduced.

**Complexity:** Robot operations take constant time and state space. Parsing
cost is linear in the command line's length. Input is processed line by line,
so memory does not grow with the total number of commands.

**Testing:** The suite covers the three supplied examples, commands before
placement, all four directions and edges, recovery after rejected moves,
rotations, repeated placements, invalid input, whitespace, and CLI file/stdin
behavior. Tests use observable outcomes instead of inspecting private fields.
Tests are JavaScript ES modules using Node's built-in test runner, directly
importing the TypeScript source.

## Validation performed

- Node.js v24.19.0: all 43 automated tests passed.
- Both fixture files matched their expected output via file input and stdin.
- Static type-checking was not run in the preparation environment because the
  TypeScript compiler was unavailable. Run the optional commands above locally.

Before submitting, run the project locally and be comfortable explaining why
coordinates stop at 4, why invalid placements preserve state, and how input
validation differs from TypeScript's compile-time types.
