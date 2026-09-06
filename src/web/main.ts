import { Robot, SIZE, Simulator } from "../domain/index.ts";
import { ROBOT_SVG, ROTATION } from "./robot-glyph.ts";

/**
 * DOM wiring for web/index.html: builds the 5x5 grid, draws the robot marker,
 * and hooks up the buttons/command box/log. All rules about what a command
 * means live in ../domain — this file only translates clicks and keystrokes
 * into command lines, and robot state back into pixels.
 */

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T | null;
  if (!element) throw new Error(`Toy Robot: missing #${id} in the page markup`);
  return element;
}

const robot = new Robot();
const sim = new Simulator(robot);

const grid = requireElement<HTMLDivElement>("grid");
const robotLayer = requireElement<HTMLDivElement>("robotLayer");
const reportEl = requireElement<HTMLDivElement>("report");
const logEl = requireElement<HTMLDivElement>("log");
const pendingCoord = requireElement<HTMLSpanElement>("pendingCoord");
const facingSelect = requireElement<HTMLSelectElement>("facingSelect");
const cmdForm = requireElement<HTMLFormElement>("cmdForm");
const cmdInput = requireElement<HTMLInputElement>("cmdInput");

let robotEl: HTMLDivElement | null = null;

function render(): void {
  const pos = robot.position;
  if (!pos) {
    if (robotEl) {
      robotEl.remove();
      robotEl = null;
    }
    reportEl.textContent = "(not placed yet)";
    pendingCoord.textContent = "click a cell…";
    return;
  }
  if (!robotEl) {
    robotEl = document.createElement("div");
    robotEl.className = "robot";
    robotEl.innerHTML = ROBOT_SVG;
    robotLayer.appendChild(robotEl);
  }
  const leftPct = (pos.x / SIZE) * 100;
  const topPct = ((SIZE - 1 - pos.y) / SIZE) * 100;
  robotEl.style.left = `${leftPct}%`;
  robotEl.style.top = `${topPct}%`;
  robotEl.style.transform = `rotate(${ROTATION[pos.facing]}deg)`;
  pendingCoord.textContent = `at ${pos.x},${pos.y},${pos.facing}`;
  // Live status readout, distinct from the command log below: the CLI/domain
  // rules only ever "print" on an explicit REPORT command, but the visual
  // state panel stays live so the UI doesn't look stale after MOVE/LEFT/RIGHT.
  reportEl.textContent = `${pos.x},${pos.y},${pos.facing}`;
}

function log(text: string, cls?: string): void {
  const line = document.createElement("div");
  if (cls) line.className = cls;
  line.textContent = text;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

function runLine(line: string): void {
  const result = sim.execute(line);
  log("> " + line, "log-cmd");
  if (result.output !== undefined) {
    log(result.output);
  } else if (!result.success) {
    log("(ignored)", "log-ignored");
  }
  render();
}

// Build 5x5 grid, row 0 (NORTH-most / y=4) at top, WEST (x=0) at left.
function buildGrid(): void {
  for (let row = 0; row < SIZE; row++) {
    const y = SIZE - 1 - row;
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset["x"] = String(x);
      cell.dataset["y"] = String(y);
      const coord = document.createElement("span");
      coord.className = "coord";
      coord.textContent = `${x},${y}`;
      cell.appendChild(coord);
      cell.addEventListener("click", () => {
        const facing = facingSelect.value;
        runLine(`PLACE ${x},${y},${facing}`);
      });
      grid.appendChild(cell);
    }
  }
}

function wireControls(): void {
  requireElement("btnMove").addEventListener("click", () => runLine("MOVE"));
  requireElement("btnLeft").addEventListener("click", () => runLine("LEFT"));
  requireElement("btnRight").addEventListener("click", () => runLine("RIGHT"));
  requireElement("btnReport").addEventListener("click", () => runLine("REPORT"));

  cmdForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = cmdInput.value.toUpperCase();
    if (!value.trim()) return;
    runLine(value);
    cmdInput.value = "";
  });
}

buildGrid();
wireControls();
render();
