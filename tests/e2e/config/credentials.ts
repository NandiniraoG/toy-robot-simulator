/**
 * Configuration and credentials for tests
 */

export const TEST_CONFIG = {
  baseURL: "file://",
  timeout: 30000,
  retries: 2,
  headless: true,
};

export const TEST_CREDENTIALS = {
  // Add credentials if needed for API testing
  // username: process.env.TEST_USERNAME || "testuser",
  // password: process.env.TEST_PASSWORD || "testpass",
};

export const ENVIRONMENTS = {
  development: {
    baseURL: "http://localhost:3000",
    timeout: 30000,
  },
  staging: {
    baseURL: "https://staging.example.com",
    timeout: 30000,
  },
  production: {
    baseURL: "https://example.com",
    timeout: 30000,
  },
};

export const getEnvironmentConfig = (env: string = "development") => {
  return ENVIRONMENTS[env as keyof typeof ENVIRONMENTS] || ENVIRONMENTS.development;
};
