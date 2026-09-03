/**
 * Environment variable utilities
 * Loads and manages environment configuration for tests
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

// Manually define __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
export const loadEnv = () => {
  const env = process.env;

  return {
    // Base URLs
    baseUrlDev: env.BASE_URL_DEV || "http://localhost:3000",
    baseUrlStaging: env.BASE_URL_STAGING || "https://staging.example.com",
    baseUrlProd: env.BASE_URL_PROD || "https://example.com",

    // Credentials
    testUsername: env.TEST_USERNAME || "",
    testPassword: env.TEST_PASSWORD || "",
    apiKey: env.API_KEY || "",

    // Test Configuration
    testTimeout: parseInt(env.TEST_TIMEOUT || "30000", 10),
    testHeadless: env.TEST_HEADLESS === "true" || env.TEST_HEADLESS !== "false",
    testRetries: parseInt(env.TEST_RETRIES || "2", 10),

    // Browser Configuration
    browser: env.BROWSER || "chromium",
  };
};

/**
 * Get the current environment
 */
export const getCurrentEnvironment = (): string => {
  return process.env.TEST_ENV || "development";
};

/**
 * Get base URL for current environment
 */
export const getBaseUrl = (): string => {
  const env = loadEnv();
  const currentEnv = getCurrentEnvironment();

  switch (currentEnv) {
    case "staging":
      return env.baseUrlStaging;
    case "production":
      return env.baseUrlProd;
    case "development":
    default:
      return env.baseUrlDev;
  }
};

/**
 * Check if running in CI/CD environment
 */
export const isCI = (): boolean => {
  return process.env.CI === "true" || !!process.env.GITHUB_ACTIONS;
};

/**
 * Get test timeout
 */
export const getTestTimeout = (): number => {
  return loadEnv().testTimeout;
};
