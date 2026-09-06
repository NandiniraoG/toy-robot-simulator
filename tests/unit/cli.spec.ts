import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Drives the built CLI as a real subprocess — the spec's "input can be from a
 * file, or from standard input" requirement, exercised both ways against the
 * command files in tests/e2e/testData/.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");
const CLI = path.join(ROOT, "dist", "cli", "main.js");
const dataFile = (name: string) => path.resolve(import.meta.dirname, "../e2e/testData", name);

type Run = { stdout: string; stderr: string; status: number | null };

/**
 * The tests below assert the CLI writes nothing to stderr on success, so the
 * child must not inherit anything that makes Node itself chatter there.
 * Setting NO_COLOR and FORCE_COLOR together makes Node emit "The 'NO_COLOR'
 * env is ignored due to the 'FORCE_COLOR' env being set" on startup, and some
 * CI images set both. Strip them rather than loosening the assertions, so a
 * genuine stray write still fails the test.
 */
function childEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env["NO_COLOR"];
  delete env["FORCE_COLOR"];
  return env;
}

function runCli(args: string[] = [], stdin = "", env = childEnv()): Run {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    input: stdin,
    encoding: "utf8",
    cwd: ROOT,
    env,
  });
  return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}

/** stdout as a list of lines, with the trailing newline dropped. */
const lines = (run: Run): string[] => run.stdout.split(/\r?\n/).filter((l) => l !== "");

const EXAMPLES = [
  { file: "example-a.txt", expected: ["0,1,NORTH"] },
  { file: "example-b.txt", expected: ["0,0,WEST"] },
  { file: "example-c.txt", expected: ["3,3,NORTH"] },
] as const;

test.describe("reads commands from a file", () => {
  for (const { file, expected } of EXAMPLES) {
    test(`data/${file} prints ${expected.join(" ")}`, () => {
      const run = runCli([dataFile(file)]);
      expect(run.status).toBe(0);
      expect(run.stderr).toBe("");
      expect(lines(run)).toEqual([...expected]);
    });
  }
});

test.describe("reads commands from standard input", () => {
  for (const { file, expected } of EXAMPLES) {
    test(`data/${file} piped in prints ${expected.join(" ")}`, () => {
      const run = runCli([], readFileSync(dataFile(file), "utf8"));
      expect(run.status).toBe(0);
      expect(lines(run)).toEqual([...expected]);
    });
  }

  test("commands typed straight in are accepted", () => {
    const run = runCli([], "PLACE 1,2,EAST\nMOVE\nMOVE\nLEFT\nMOVE\nREPORT\n");
    expect(lines(run)).toEqual(["3,3,NORTH"]);
  });

  test("lower case input is accepted", () => {
    const run = runCli([], "place 0,0,north\nmove\nreport\n");
    expect(lines(run)).toEqual(["0,1,NORTH"]);
  });

  test("empty input produces no output and succeeds", () => {
    const run = runCli([], "");
    expect(run.status).toBe(0);
    expect(run.stdout).toBe("");
  });
});

test("blocked moves still leave the robot able to move, end to end", () => {
  const run = runCli([dataFile("edge-cases.txt")]);
  expect(run.status).toBe(0);
  expect(lines(run)).toEqual([
    "2,4,NORTH",
    "2,4,NORTH",
    "3,4,EAST",
    "3,4,EAST",
    "0,0,WEST",
    "0,0,SOUTH",
    "0,1,NORTH",
  ]);
});

test("malformed commands are ignored without corrupting state", () => {
  const run = runCli([dataFile("invalid-input.txt")]);
  expect(run.status).toBe(0);
  expect(lines(run)).toEqual(["1,1,NORTH", "1,1,NORTH", "2,2,EAST"]);
});

test("output is unaffected by conflicting colour environment variables", () => {
  // Both set at once is what makes Node warn on startup; the robot's output
  // must still be exactly the reported coordinates.
  const run = runCli([dataFile("example-a.txt")], "", {
    ...process.env,
    NO_COLOR: "1",
    FORCE_COLOR: "1",
  });
  expect(run.status).toBe(0);
  expect(lines(run)).toEqual(["0,1,NORTH"]);
});

test.describe("error handling", () => {
  test("a missing file fails with a message rather than a stack trace", () => {
    const run = runCli([dataFile("does-not-exist.txt")]);
    expect(run.status).toBe(1);
    expect(run.stdout).toBe("");
    expect(run.stderr).toContain("toy-robot:");
    expect(run.stderr).not.toContain("at ");
  });

  test("--help prints usage and exits cleanly", () => {
    const run = runCli(["--help"]);
    expect(run.status).toBe(0);
    expect(run.stdout).toContain("Usage: toy-robot");
  });
});
