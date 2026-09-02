import test from 'node:test';
import assert from 'node:assert/strict';
import { Robot, Table } from '../src/robot.ts';
import { Simulator } from '../src/simulator.ts';

const run = (commands) => {
  const simulator = new Simulator();
  return commands.split('\n').map(line => simulator.execute(line)).filter(x => x !== undefined);
};

for (const [commands, expected] of [
  ['PLACE 0,0,NORTH\nMOVE\nREPORT', '0,1,NORTH'],
  ['PLACE 0,0,NORTH\nLEFT\nREPORT', '0,0,WEST'],
  ['PLACE 1,2,EAST\nMOVE\nMOVE\nLEFT\nMOVE\nREPORT', '3,3,NORTH'],
]) {
  test(`required example: ${expected}`, () => assert.deepEqual(run(commands), [expected]));
}

test('ignores commands until a valid placement', () => {
  assert.deepEqual(run('MOVE\nLEFT\nRIGHT\nREPORT\nPLACE 5,0,NORTH\nREPORT\nPLACE 0,0,EAST\nMOVE\nREPORT'), ['1,0,EAST']);
});

for (const [facing, x, y] of [['NORTH', 4, 4], ['EAST', 4, 0], ['SOUTH', 0, 0], ['WEST', 0, 4]]) {
  test(`rejects ${facing} edge move and accepts subsequent valid move`, () => {
    const robot = new Robot();
    robot.place(x, y, facing);
    robot.move();
    assert.equal(robot.report(), `${x},${y},${facing}`);
    robot.right(); robot.right(); robot.move();
    const expected = { NORTH: '4,3,SOUTH', EAST: '3,0,WEST', SOUTH: '0,1,NORTH', WEST: '1,4,EAST' };
    assert.equal(robot.report(), expected[facing]);
  });
}

for (const [facing, expected] of [['NORTH', '2,3,NORTH'], ['EAST', '3,2,EAST'], ['SOUTH', '2,1,SOUTH'], ['WEST', '1,2,WEST']]) {
  test(`moves one unit ${facing}`, () => assert.deepEqual(run(`PLACE 2,2,${facing}\nMOVE\nREPORT`), [expected]));
}

for (const [command, directions] of [
  ['LEFT', ['WEST', 'SOUTH', 'EAST', 'NORTH']],
  ['RIGHT', ['EAST', 'SOUTH', 'WEST', 'NORTH']],
]) {
  test(`${command} completes a full rotation without moving`, () => {
    const simulator = new Simulator();
    simulator.execute('PLACE 2,3,NORTH');
    for (const facing of directions) {
      simulator.execute(command);
      assert.equal(simulator.execute('REPORT'), `2,3,${facing}`);
    }
  });
}

test('a later valid PLACE resets location and direction', () => {
  assert.deepEqual(run('PLACE 0,0,NORTH\nMOVE\nPLACE 4,3,WEST\nREPORT\nMOVE\nREPORT'), ['4,3,WEST', '3,3,WEST']);
});

for (const invalid of [
  'PLACE -1,0,NORTH', 'PLACE 0,-1,NORTH', 'PLACE 5,0,NORTH', 'PLACE 0,5,NORTH',
  'PLACE 1.5,2,NORTH', 'PLACE 1,2,UP', 'PLACE 1,2,north', 'PLACE 1,2',
  'PLACE 1,2,EAST junk', 'PLACE 999999999999999999999,0,NORTH',
  'PLACE NaN,0,NORTH', 'MOVE EXTRA', 'REPORT EXTRA', 'JUMP', 'move', '',
]) {
  test(`ignores malformed or invalid command: ${JSON.stringify(invalid)}`, () => {
    assert.deepEqual(run(`PLACE 1,1,EAST\n${invalid}\nMOVE\nREPORT`), ['2,1,EAST']);
  });
}

test('accepts surrounding whitespace and spaces around commas', () => {
  assert.deepEqual(run('  PLACE  1 , 2 , EAST  \r\n MOVE \r\n REPORT '), ['2,2,EAST']);
});

test('unplaced robot methods are safe no-ops', () => {
  const robot = new Robot();
  robot.move(); robot.left(); robot.right();
  assert.equal(robot.report(), undefined);
});

test('domain API rejects invalid numeric coordinates and directions', () => {
  const robot = new Robot();
  robot.place(2, 2, 'NORTH');
  for (const number of [-1, 5, 1.5, NaN, Infinity]) {
    robot.place(number, 0, 'NORTH');
    robot.place(0, number, 'NORTH');
    assert.equal(robot.report(), '2,2,NORTH');
  }
  robot.place(0, 0, 'UP');
  assert.equal(robot.report(), '2,2,NORTH');
});

test('table validates its size and all corner cells', () => {
  for (const size of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => new Table(size), RangeError);
  const table = new Table();
  for (const [x, y] of [[0, 0], [4, 0], [0, 4], [4, 4]]) assert.equal(table.contains(x, y), true);
  const robot = new Robot(new Table(1));
  robot.place(0, 0, 'EAST'); robot.move();
  assert.equal(robot.report(), '0,0,EAST');
});
