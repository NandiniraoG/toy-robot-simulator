import { readFile } from "node:fs/promises";
import { Robot, Simulator, Table } from "../domain/index.ts";

/**
 * Command-line front end: reads commands from a file when given a path, and
 * from standard input otherwise (the spec allows either).
 *
 *   node dist/cli/main.js tests/e2e/testData/example-a.txt
 *   node dist/cli/main.js < tests/e2e/testData/example-a.txt
 *   printf 'PLACE 0,0,NORTH\nMOVE\nREPORT\n' | node dist/cli/main.js
 *
 * Only REPORT writes to stdout, one `X,Y,F` line per command, which is
 * exactly the output shape the spec's examples show. Every other command is
 * silent, and anything invalid is ignored rather than reported as an error —
 * a garbage line must not derail the rest of the run.
 */

const USAGE = `Usage: toy-robot [FILE]

Reads PLACE/MOVE/LEFT/RIGHT/REPORT commands from FILE, or from standard
input when no FILE is given. REPORT prints the robot's X,Y,F to stdout.
Blank lines and lines starting with # are skipped.`;

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readCommands(filePath: string | undefined): Promise<string> {
  if (filePath !== undefined) return readFile(filePath, "utf8");
  // Nothing piped in and no file given: say so instead of hanging silently on
  // a terminal that will never send EOF on its own.
  if (process.stdin.isTTY) {
    process.stderr.write(`${USAGE}\n\nReading from stdin — end with Ctrl+Z (Windows) or Ctrl+D.\n`);
  }
  return readStdin();
}

export async function main(argv: readonly string[]): Promise<void> {
  const filePath = argv[2];
  if (filePath === "--help" || filePath === "-h") {
    process.stdout.write(`${USAGE}\n`);
    return;
  }

  const source = await readCommands(filePath);
  const simulator = new Simulator(new Robot(new Table()));

  for (const line of source.split(/\r?\n/)) {
    const command = line.trim();
    if (command === "" || command.startsWith("#")) continue;
    const { output } = simulator.execute(command);
    if (output !== undefined) process.stdout.write(`${output}\n`);
  }
}

main(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`toy-robot: ${message}\n`);
  process.exitCode = 1;
});
