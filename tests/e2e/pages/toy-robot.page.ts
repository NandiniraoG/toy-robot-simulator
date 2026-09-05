import { pathToFileURL } from "node:url";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { TOY_ROBOT_LOCATORS } from "./locators";

export type Facing = "NORTH" | "EAST" | "SOUTH" | "WEST";

const PAGE_PATH = path.resolve(import.meta.dirname, "../../../web/index.html");

/**
 * Page Object Model for the static toy-robot web demo (web/index.html).
 * Encapsulates its DOM structure so specs read in terms of robot commands,
 * not selectors.
 */
export class ToyRobotPage extends BasePage {
  readonly facingSelect: Locator;
  readonly moveButton: Locator;
  readonly leftButton: Locator;
  readonly rightButton: Locator;
  readonly reportButton: Locator;
  readonly commandInput: Locator;
  readonly runButton: Locator;
  readonly stateReadout: Locator;
  readonly logLines: Locator;
  readonly robotMarker: Locator;

  constructor(page: Page) {
    super(page);
    this.facingSelect = page.locator(TOY_ROBOT_LOCATORS.placement.facingSelect);
    this.moveButton = page.locator(TOY_ROBOT_LOCATORS.buttons.move);
    this.leftButton = page.locator(TOY_ROBOT_LOCATORS.buttons.left);
    this.rightButton = page.locator(TOY_ROBOT_LOCATORS.buttons.right);
    this.reportButton = page.locator(TOY_ROBOT_LOCATORS.buttons.report);
    this.commandInput = page.locator(TOY_ROBOT_LOCATORS.commandInput.input);
    this.runButton = page.locator(TOY_ROBOT_LOCATORS.buttons.run);
    this.stateReadout = page.locator(TOY_ROBOT_LOCATORS.display.stateReadout);
    this.logLines = page.locator(TOY_ROBOT_LOCATORS.display.logLines);
    this.robotMarker = page.locator(TOY_ROBOT_LOCATORS.display.robotMarker);
  }

  /**
   * Navigate to the Toy Robot page
   */
  async goto(): Promise<void> {
    await super.goto(pathToFileURL(PAGE_PATH).href);
  }

  /**
   * Placement
   */
  async clickCell(x: number, y: number): Promise<void> {
    await this.page.locator(TOY_ROBOT_LOCATORS.placement.cell(x, y)).click();
  }

  async placeAt(x: number, y: number, facing: Facing): Promise<void> {
    await this.facingSelect.selectOption(facing);
    await this.clickCell(x, y);
  }

  /**
   * Command buttons
   */
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

  /**
   * Raw command input
   */
  async runCommand(command: string): Promise<void> {
    await this.commandInput.fill(command);
    await this.runButton.click();
  }

  /**
   * Submits the raw command input by pressing Enter instead of clicking
   * Run, exercising the form's native submit event separately from a
   * button click.
   */
  async runCommandWithEnter(command: string): Promise<void> {
    await this.commandInput.fill(command);
    await this.commandInput.press("Enter");
  }

  /**
   * Display and state
   */
  async currentState(): Promise<string> {
    return this.getText(this.stateReadout);
  }

  async getLogLines(): Promise<string[]> {
    return this.getAllText(this.logLines);
  }

  async lastLogLine(): Promise<string> {
    const lines = await this.getLogLines();
    return lines.at(-1) ?? "";
  }

  /**
   * The marker (`.robot`) only exists in the DOM once the robot has been
   * placed at least once; it is never removed once created, only repositioned.
   */
  async isRobotMarkerVisible(): Promise<boolean> {
    return (await this.robotMarker.count()) > 0;
  }
}
