# Playwright Test Structure - Page Object Model (POM)

This directory contains Playwright E2E tests organized using the Page Object Model pattern with TypeScript.

## Directory Structure

```
tests/e2e/
├── pages/
│   ├── base.page.ts           # Base page class with common methods
│   ├── toy-robot.page.ts      # Page Object for Toy Robot application
│   └── locators.ts            # Centralized locators organized by sections
├── specs/
│   ├── placement.spec.ts      # Placement functionality tests
│   ├── movement.spec.ts       # Movement and rotation tests
│   ├── boundaries.spec.ts     # Edge case and boundary tests
│   └── commands.spec.ts       # Raw command input tests
├── fixtures/
│   └── test-data.ts           # Test cases and data fixtures
├── config/
│   └── credentials.ts         # Environment configuration and credentials
├── utils/
│   └── env.utils.ts           # Environment variable utilities
└── .env.example               # Environment configuration template
```

## Key Features

### 1. Page Object Model (POM)
- **BasePage**: Common methods for all page objects (navigation, waiting, screenshots, etc.)
- **ToyRobotPage**: Extends BasePage with robot-specific methods and locators
- **Locators**: Centralized and organized by functional sections

### 2. Switch Case Method
The `ToyRobotPage` includes a `switchCase()` method for context-aware testing:

```typescript
// Switches to placement context
robot.switchCase("placement");
await robot.placeAt(0, 0, "NORTH");

// Switches to buttons context
robot.switchCase("buttons");
await robot.move();

// Switches to commandInput context
robot.switchCase("commandInput");
await robot.runCommand("PLACE 1,2,EAST");
```

### 3. Organized Locators
Locators are centralized in `locators.ts` and organized by functional sections:

```typescript
TOY_ROBOT_LOCATORS = {
  placement: { ... },
  buttons: { ... },
  commandInput: { ... },
  display: { ... },
  compass: { ... },
  header: { ... }
}
```

### 4. Test Data and Fixtures
The `test-data.ts` file contains:
- `TestCase` interface for structured test cases
- `TestStep` interface for test steps
- `TEST_CASES` object with predefined test scenarios
- `TEST_SCENARIOS` organized by category

### 5. Configuration and Credentials
- `config/credentials.ts`: Environment-based configuration
- `.env.example`: Template for environment variables
- `utils/env.utils.ts`: Utilities for loading environment configuration

## Usage Examples

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run specific spec file
npx playwright test tests/e2e/specs/placement.spec.ts

# Run tests matching pattern
npx playwright test -g "placement"
```

### Creating a New Test

1. Create a spec file in `specs/` directory:

```typescript
import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";

test.describe("Feature Name - Test Group", () => {
  let robot: ToyRobotPage;

  test.beforeEach(async ({ page }) => {
    robot = new ToyRobotPage(page);
    await robot.goto();
  });

  test("specific test case", async () => {
    robot.switchCase("placement");
    await robot.placeAt(1, 1, "NORTH");
    expect(await robot.currentState()).toBe("1,1,NORTH");
  });
});
```

### Adding Page Methods

1. Extend `BasePage` in your page object:

```typescript
export class MyPage extends BasePage {
  async customMethod() {
    await this.waitForElement(this.someLocator);
    return this.getText(this.someLocator);
  }
}
```

### Using Test Data

1. Import test cases and use them in specs:

```typescript
import { TEST_CASES, TEST_SCENARIOS } from "../fixtures/test-data";

// Use individual test case
const testCase = TEST_CASES.BASIC_PLACEMENT;

// Use test scenarios
TEST_SCENARIOS.placement.forEach((scenario) => {
  test(`${scenario.name}`, async () => {
    // Test implementation
  });
});
```

## Test Cases

### Placement Tests
- No placement state
- Basic placement by clicking
- Re-placement at same location
- Case switching during placement

### Movement Tests
- Movement in all directions (North, East, South, West)
- Rotation (LEFT, RIGHT)
- REPORT functionality
- Case switching during movement

### Boundary Tests
- Edge blocking in all directions
- Invalid commands
- Commands before placement
- Multiple invalid commands

### Command Input Tests
- Raw command execution
- Complex command sequences
- Spec examples A, B, C
- Empty command handling

## Best Practices

1. **Use Page Object Methods**: Always use page object methods instead of direct Playwright calls
2. **Switch Cases**: Use `switchCase()` method to indicate which part of the UI you're testing
3. **Test Data**: Use fixtures and test data for DRY principle
4. **Assertions**: Use `expect()` from Playwright for assertions
5. **Polling**: Use `expect.poll()` for elements that update asynchronously
6. **Screenshots**: Use `screenshot()` method for debugging failed tests

## Environment Configuration

Create a `.env` file in `tests/e2e/` directory (copy from `.env.example`):

```env
BASE_URL_DEV=http://localhost:3000
TEST_TIMEOUT=30000
TEST_HEADLESS=true
BROWSER=chromium
```

Load environment configuration in your tests:

```typescript
import { loadEnv, getEnvironmentConfig } from "../config/credentials";

const config = loadEnv();
const envConfig = getEnvironmentConfig("development");
```

## Troubleshooting

### Tests timing out
- Increase `TEST_TIMEOUT` in `.env` file
- Use `test.setTimeout()` in individual tests
- Check network connectivity

### Locators not found
- Verify locator strings in `locators.ts`
- Use `--debug` mode to inspect elements
- Check if page has loaded with `waitForElement()`

### Flaky tests
- Use `expect.poll()` for asynchronous updates
- Add explicit waits with `waitForElement()`
- Increase `testTimeout` value

## CI/CD Integration

The tests are configured to run in CI/CD environments:

```bash
# GitHub Actions example
- name: Run E2E Tests
  run: npm run test:e2e
```

Tests automatically detect CI environment and adjust settings accordingly.
