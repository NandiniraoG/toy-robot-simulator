import { pathToFileURL } from "node:url";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";

export type Facing = "NORTH" | "EAST" | "SOUTH" | "WEST";

const PAGE_PATH = path.resolve(import.meta.dirname, "../../../src/web/index.html");

const SELECTORS = {
  placement: {
    cell: (x: number, y: number) => `.cell[data-x="${x}"][data-y="${y}"]`,
    facingSelect: "#facingSelect",
  },
  buttons: {
    move: "#btnMove",
    left: "#btnLeft",
    right: "#btnRight",
    run: '#cmdForm button[type="submit"]',
  },
  commandInput: "#cmdInput",
  display: {
    stateReadout: "#report",
    logLines: "#log div",
    robotMarker: "#robotLayer .robot",
  },
};

export class ToyRobotPage {
  constructor(readonly page: Page) {}

  get facingSelect(): Locator { return this.page.locator(SELECTORS.placement.facingSelect); }
  get moveButton(): Locator { return this.page.locator(SELECTORS.buttons.move); }
  get leftButton(): Locator { return this.page.locator(SELECTORS.buttons.left); }
  get rightButton(): Locator { return this.page.locator(SELECTORS.buttons.right); }
  get commandInput(): Locator { return this.page.locator(SELECTORS.commandInput); }
  get runButton(): Locator { return this.page.locator(SELECTORS.buttons.run); }
  get stateReadout(): Locator { return this.page.locator(SELECTORS.display.stateReadout); }
  get logLines(): Locator { return this.page.locator(SELECTORS.display.logLines); }
  get robotMarker(): Locator { return this.page.locator(SELECTORS.display.robotMarker); }

  /**
   * Navigate to the Toy Robot page
   */
  async goto(): Promise<void> {
    await this.page.goto(pathToFileURL(PAGE_PATH).href);
  }

  /**
   * Placement
   */
  async clickCell(x: number, y: number): Promise<void> {
    await this.page.locator(SELECTORS.placement.cell(x, y)).click();
  }

  async placeAt(x: number, y: number, facing: Facing): Promise<void> {
    await this.facingSelect.selectOption(facing);
    await this.clickCell(x, y);
  }

  async move(): Promise<void> {
    await this.moveButton.click();
  }

  async turnLeft(): Promise<void> {
    await this.leftButton.click();
  }

  async turnRight(): Promise<void> {
    await this.rightButton.click();
  }

  async runCommand(command: string): Promise<void> {
    await this.commandInput.fill(command);
    await this.runButton.click();
  }

  async runCommands(commands: string[]): Promise<void> {
    for (const command of commands) {
      await this.runCommand(command);
    }
  }

  async currentState(): Promise<string> {
    return ((await this.stateReadout.textContent()) ?? "").trim();
  }

  async lastLogLine(): Promise<string> {
    const lines = await this.logLines.allTextContents();
    return lines.at(-1) ?? "";
  }

  /**
   * Count of robot markers on the board — 0 before the first PLACE, 1 after.
   * Prefer asserting on the `robotMarker` locator itself
   * (`expect(page.robotMarker).toBeVisible()`) when what you mean is
   * visibility: that retries, and existence is not the same as being shown.
   */
  async robotMarkerCount(): Promise<number> {
    return this.robotMarker.count();
  }
}
