import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { Simulator } from './simulator.ts';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    throw new Error('Usage: node src/cli.ts [commands-file]');
  }

  const input = args[0] === undefined ? process.stdin : createReadStream(args[0], 'utf8');
  const lines = createInterface({ input, crlfDelay: Infinity });
  const simulator = new Simulator();
  try {
    for await (const line of lines) {
      const output = simulator.execute(line);
      if (output !== undefined) process.stdout.write(`${output}\n`);
    }
  } finally {
    lines.close();
    if (input !== process.stdin) input.destroy();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
