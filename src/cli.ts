import { readFile } from "node:fs/promises";
import { ToyRobotSimulator } from "./simulator.ts";

const input = await readInput(process.argv[2]);
const simulator = new ToyRobotSimulator();

for (const output of simulator.run(input)) {
  console.log(output);
}

async function readInput(filePath?: string): Promise<string> {
  if (filePath) {
    return readFile(filePath, "utf8");
  }

  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}
