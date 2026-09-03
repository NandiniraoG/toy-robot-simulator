import { pathToFileURL } from "node:url";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { TOY_ROBOT_LOCATORS, type LocatorSection } from "./locators";

export type Facing = "NORTH" | "EAST" | "SOUTH" | "WEST";

type Case = "placement" | "buttons" | "commandInput" | "display" | "compass" | "header";

const PAGE_PATH = path.resolve(import.meta.dirname, "../../../web/index.html");

/**
 * Page Object Model for the static toy-robot web demo (web/index.html).
 * Encapsulates its DOM structure so specs read in terms of robot commands,
 * not selectors.
 *
 * Features:
 * - Extends BasePage for common functionality
 * - Organized locators by functional sections
 * - Switch method for dynamic test case handling
 * - Comprehensive robot command methods
 */
export class ToyRobotPage extends BasePage {
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
  readonly logLines: Locator;

  private currentCase: Case = "placement";

  constructor(page: Page) {
    super(page);
    // Initialize locators using centralized locators
    this.facingSelect = page.locator(TOY_ROBOT_LOCATORS.placement.facingSelect);
    this.pendingCoord = page.locator(TOY_ROBOT_LOCATORS.placement.pendingCoord);
    this.moveButton = page.locator(TOY_ROBOT_LOCATORS.buttons.move);
    this.leftButton = page.locator(TOY_ROBOT_LOCATORS.buttons.left);
    this.rightButton = page.locator(TOY_ROBOT_LOCATORS.buttons.right);
    this.reportButton = page.locator(TOY_ROBOT_LOCATORS.buttons.report);
    this.commandInput = page.locator(TOY_ROBOT_LOCATORS.commandInput.input);
    this.runButton = page.locator(TOY_ROBOT_LOCATORS.buttons.run);
    this.stateReadout = page.locator(TOY_ROBOT_LOCATORS.display.stateReadout);
    this.log = page.locator(TOY_ROBOT_LOCATORS.display.log);
    this.logLines = page.locator(TOY_ROBOT_LOCATORS.display.logLines);
  }

  /**
   * Switch between different test cases/sections
   * Allows dynamic handling of different functional areas
   */
  switchCase(testCase: Case): this {
    this.currentCase = testCase;
    return this;
  }

  /**
   * Get the current test case context
   */
  getCurrentCase(): Case {
    return this.currentCase;
  }

  /**
   * Get locators for a specific functional section
   */
  getLocators(section: LocatorSection) {
    return TOY_ROBOT_LOCATORS[section];
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

  /**
   * Navigate to the Toy Robot page
   */
  async goto(): Promise<void> {
    await super.goto(pathToFileURL(PAGE_PATH).href);
    this.switchCase("placement");
  }

  /**
   * Placement Case Methods
   */
  async selectFacing(facing: Facing): Promise<void> {
    this.switchCase("placement");
    await this.facingSelect.selectOption(facing);
  }

  async clickCell(x: number, y: number): Promise<void> {
    this.switchCase("placement");
    await this.page.locator(TOY_ROBOT_LOCATORS.placement.cell(x, y)).click();
  }

  async placeAt(x: number, y: number, facing: Facing): Promise<void> {
    this.switchCase("placement");
    await this.selectFacing(facing);
    await this.clickCell(x, y);
  }

  /**
   * Command Button Methods
   */
  async move(): Promise<void> {
    this.switchCase("buttons");
    await this.moveButton.click();
  }

  async turnLeft(): Promise<void> {
    this.switchCase("buttons");
    await this.leftButton.click();
  }

  async turnRight(): Promise<void> {
    this.switchCase("buttons");
    await this.rightButton.click();
  }

  async report(): Promise<void> {
    this.switchCase("buttons");
    await this.reportButton.click();
  }

  /**
   * Command Input Methods
   */
  async runCommand(command: string): Promise<void> {
    this.switchCase("commandInput");
    await this.commandInput.fill(command);
    await this.runButton.click();
  }

  /**
   * Display and State Methods
   */
  async currentState(): Promise<string> {
    this.switchCase("display");
    return this.getText(this.stateReadout);
  }

  async getLogLines(): Promise<string[]> {
    this.switchCase("display");
    return this.getAllText(this.logLines);
  }

  async lastLogLine(): Promise<string> {
    this.switchCase("display");
    const lines = await this.getLogLines();
    return lines.at(-1) ?? "";
  }

  /**
   * Compass Navigation Methods
   */
  async getCompassLocators() {
    return this.getLocators("compass");
  }

  /**
   * Header Methods
   */
  async getPageTitle(): Promise<string> {
    return super.getTitle();
  }
}
