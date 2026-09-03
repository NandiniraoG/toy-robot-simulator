/**
 * Base Page Object Model class
 * Provides common functionality for all page objects
 */

import type { Locator, Page } from "@playwright/test";

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
  }

  /**
   * Wait for an element to be hidden
   */
  async waitForElementHidden(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: "hidden", timeout });
  }

  /**
   * Get text content of an element
   */
  async getText(locator: Locator): Promise<string> {
    return ((await locator.textContent()) ?? "").trim();
  }

  /**
   * Get all text contents from multiple elements
   */
  async getAllText(locator: Locator): Promise<string[]> {
    return locator.allTextContents();
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  /**
   * Take a screenshot
   */
  async screenshot(path: string): Promise<Buffer> {
    return this.page.screenshot({ path });
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }
}
