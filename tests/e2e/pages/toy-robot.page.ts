import { pathToFileURL } from "node:url";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";

export type Facing = "NORTH" | "EAST" | "SOUTH" | "WEST";

const PAGE_PATH = path.resolve(import.meta.dirname, "../../../web/index.html");

/**
 * Page Object Model for the static toy-robot web demo (web/index.html).
 * Encapsulates its DOM structure so specs read in terms of robot commands,
 * not selectors.
 */
export class ToyRobotPage {
  readonly page: Page;
  readonly facingSelect: Locator;
  readonly pendingCoord: Locator;
  readonly moveButton: Locator;
  readonly leftButton: Locator;
  readonly rightButton: Locator;
  readonly reportButton: Locator;
  readonly commandInput: Locator;
  readonly runButton: Locator;
  readonly stateReadout: Locator;
  readonly log: Locator;

  constructor(page: Page) {
    this.page = page;
    this.facingSelect = page.locator("#facingSelect");
    this.pendingCoord = page.locator("#pendingCoord");
    this.moveButton = page.locator("#btnMove");
    this.leftButton = page.locator("#btnLeft");
    this.rightButton = page.locator("#btnRight");
    this.reportButton = page.locator("#btnReport");
    this.commandInput = page.locator("#cmdInput");
    this.runButton = page.locator('#cmdForm button[type="submit"]');
    this.stateReadout = page.locator("#report");
    this.log = page.locator("#log");
  }

  async goto(): Promise<void> {
    await this.page.goto(pathToFileURL(PAGE_PATH).href);
  }

  async selectFacing(facing: Facing): Promise<void> {
    await this.facingSelect.selectOption(facing);
  }

  async clickCell(x: number, y: number): Promise<void> {
    await this.page.locator(`.cell[data-x="${x}"][data-y="${y}"]`).click();
  }

  /** Places the robot by selecting a facing, then clicking the target cell. */
  async placeAt(x: number, y: number, facing: Facing): Promise<void> {
    await this.selectFacing(facing);
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

  async report(): Promise<void> {
    await this.reportButton.click();
  }

  /** Types a raw command (e.g. "PLACE 1,2,EAST") into the free-text box and submits it. */
  async runCommand(command: string): Promise<void> {
    await this.commandInput.fill(command);
    await this.runButton.click();
  }

  /** The live "current state" readout, e.g. "1,2,EAST" or "(not placed yet)". */
  async currentState(): Promise<string> {
    return ((await this.stateReadout.textContent()) ?? "").trim();
  }

  /** All command-log lines, oldest first, as plain text. */
  async logLines(): Promise<string[]> {
    return this.log.locator("div").allTextContents();
  }

  /** The most recently appended command-log line. */
  async lastLogLine(): Promise<string> {
    const lines = await this.logLines();
    return lines.at(-1) ?? "";
  }
}
