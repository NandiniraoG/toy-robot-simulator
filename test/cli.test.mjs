import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('../', import.meta.url));
const cli = (args = [], input = '') => spawnSync(process.execPath, ['src/cli.ts', ...args], { cwd, input, encoding: 'utf8' });

for (const name of ['examples', 'edge-cases']) {
  for (const source of ['file', 'stdin']) {
    test(`${name} fixture via ${source}`, () => {
      const input = readFileSync(new URL(`../examples/${name}.txt`, import.meta.url), 'utf8');
      const expected = readFileSync(new URL(`../examples/${name}.expected.txt`, import.meta.url), 'utf8');
      const result = source === 'file' ? cli([`examples/${name}.txt`]) : cli([], input);
      assert.equal(result.status, 0);
      assert.equal(result.stderr, '');
      assert.equal(result.stdout, expected);
    });
  }
}
test('handles CRLF and final line without newline', () => {
  const result = cli([], 'PLACE 0,0,EAST\r\nMOVE\r\nREPORT');
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '1,0,EAST\n');
});
test('empty input emits nothing and exits successfully', () => {
  const result = cli();
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
});
test('unreadable input file fails with a diagnostic', () => {
  const result = cli(['examples/does-not-exist.txt']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ENOENT/);
  assert.equal(result.stdout, '');
});
test('extra arguments fail with usage information', () => {
  const result = cli(['one', 'two']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
});
