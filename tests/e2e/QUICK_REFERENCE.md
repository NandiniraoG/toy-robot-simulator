# POM Quick Reference Guide

## 📋 Project Structure Summary

```
tests/e2e/
├── pages/                          # Page Objects
│   ├── base.page.ts               # Base class with common methods
│   ├── toy-robot.page.ts          # Main page object (switch case enabled)
│   └── locators.ts                # Centralized locators by section
├── specs/                         # Test Specifications
│   ├── placement.spec.ts          # Tests: Placement functionality
│   ├── movement.spec.ts           # Tests: Movement & rotation
│   ├── boundaries.spec.ts         # Tests: Edge cases & invalid commands
│   ├── commands.spec.ts           # Tests: Raw command input
│   └── toy-robot.spec.ts          # Original tests (legacy)
├── fixtures/                      # Test Data
│   └── test-data.ts              # Test cases, scenarios, interfaces
├── config/                        # Configuration
│   └── credentials.ts             # Environment configs, credentials
├── utils/                         # Utilities
│   └── env.utils.ts              # Environment variable functions
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
└── README.md                      # Full documentation
```

## 🔑 Key Files and Responsibilities

### BasePage (`pages/base.page.ts`)
```typescript
// Common methods for all page objects
- goto(url): Navigate to URL
- waitForElement(locator): Wait for element visibility
- getText(locator): Get element text
- isVisible(locator): Check if element is visible
- screenshot(path): Take screenshot
- reload(): Reload page
```

### ToyRobotPage (`pages/toy-robot.page.ts`)
```typescript
// Extends BasePage with robot-specific methods
- switchCase(case): Switch test context
- getCurrentCase(): Get current case
- getLocators(section): Get locators for section
- placeAt(x, y, facing): Place robot
- move(): Move robot
- turnLeft/turnRight(): Rotate robot
- runCommand(cmd): Execute raw command
- currentState(): Get robot state
- getLogLines(): Get command log
```

### Locators (`pages/locators.ts`)
```typescript
// Organized by functional sections
TOY_ROBOT_LOCATORS = {
  placement: { facingSelect, cell(x,y), ... }
  buttons: { move, left, right, report, run }
  commandInput: { input, form }
  display: { stateReadout, log, logLines }
  compass: { container, north, south, east, west }
  header: { title, description }
}
```

### Test Data (`fixtures/test-data.ts`)
```typescript
// Interfaces
- TestCase: { id, name, description, steps, expected }
- TestStep: { action, params }

// Pre-defined test cases
TEST_CASES: {
  NO_PLACEMENT, BASIC_PLACEMENT, MOVE_NORTH, MOVE_EAST,
  EDGE_BOUNDARY, ROTATION, COMPLEX_SEQUENCE, RAW_COMMAND
}

// Organized scenarios
TEST_SCENARIOS: {
  placement: [...], movement: [...], boundaries: [...], ...
}
```

### Configuration (`config/credentials.ts`)
```typescript
// Environment configs
TEST_CONFIG: { baseURL, timeout, retries, headless }
TEST_CREDENTIALS: { username, password, ... }
ENVIRONMENTS: { development, staging, production }
getEnvironmentConfig(env): Get config for environment
```

### Environment Utilities (`utils/env.utils.ts`)
```typescript
// Environment functions
loadEnv(): Load all env variables
getCurrentEnvironment(): Get current env
getEnvironmentConfig(): Get env-specific config
getBaseUrl(): Get base URL for current env
isCI(): Check if running in CI
getTestTimeout(): Get timeout value
```

## 🎯 Usage Patterns

### Pattern 1: Using Switch Case
```typescript
test("test with case switching", async () => {
  let robot = new ToyRobotPage(page);
  
  // Switch to placement case
  robot.switchCase("placement");
  await robot.placeAt(0, 0, "NORTH");
  
  // Switch to buttons case
  robot.switchCase("buttons");
  await robot.move();
  
  // Switch to display case to check state
  robot.switchCase("display");
  const state = await robot.currentState();
  expect(state).toBe("0,1,NORTH");
});
```

### Pattern 2: Using Test Data
```typescript
test.describe("Placement Tests", () => {
  TEST_SCENARIOS.placement.forEach((testCase) => {
    test(testCase.name, async ({ page }) => {
      const robot = new ToyRobotPage(page);
      // Execute test steps
      // Verify expected result
    });
  });
});
```

### Pattern 3: Using Environment Configuration
```typescript
import { getEnvironmentConfig, getBaseUrl } from "../config/credentials";

test("test with env config", async ({ page }) => {
  const baseUrl = getBaseUrl();
  await page.goto(baseUrl);
  // Test continues...
});
```

### Pattern 4: Using Base Page Methods
```typescript
test("test with base methods", async ({ page }) => {
  const robot = new ToyRobotPage(page);
  
  // Use base page methods
  await robot.goto(url);
  await robot.waitForElement(robot.moveButton);
  const isVisible = await robot.isVisible(robot.stateReadout);
  await robot.screenshot("debug.png");
});
```

## 📊 Test Organization

### By Category
- **Placement Tests** (4 tests)
- **Movement Tests** (5 tests)
- **Boundary Tests** (7 tests)
- **Command Input Tests** (6 tests)
- **Original Spec Tests** (13 tests)

**Total: 35 tests ✅**

### By Functional Area
```
tests/e2e/specs/
├── placement.spec.ts        # placeAt(), selectFacing(), clickCell()
├── movement.spec.ts         # move(), turnLeft(), turnRight(), report()
├── boundaries.spec.ts       # Edge detection, invalid commands
├── commands.spec.ts         # runCommand(), complex sequences
└── toy-robot.spec.ts        # Original comprehensive tests
```

## 🔧 Running Tests

```bash
# All tests
npm run test:e2e

# Specific file
npx playwright test tests/e2e/specs/placement.spec.ts

# Pattern matching
npx playwright test -g "placement"

# With UI
npm run test:e2e:ui

# Headed mode
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

## 📝 Adding New Tests

### Step 1: Create Test File
```bash
# Create: tests/e2e/specs/newfeature.spec.ts
```

### Step 2: Write Test
```typescript
import { expect, test } from "@playwright/test";
import { ToyRobotPage } from "../pages/toy-robot.page";

test.describe("Feature - New Feature Tests", () => {
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

### Step 3: Run Tests
```bash
npm run test:e2e
```

## 📌 Best Practices

1. ✅ Always use page object methods, not direct Playwright calls
2. ✅ Use `switchCase()` to document which UI section you're testing
3. ✅ Organize tests by functional area
4. ✅ Use test data fixtures for DRY code
5. ✅ Keep locators centralized in `locators.ts`
6. ✅ Use `expect.poll()` for async updates
7. ✅ Store sensitive data in `.env` file
8. ✅ Use `screenshot()` for debugging failed tests

## 🚀 Integration with CI/CD

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🐛 Debugging

### Enable Debug Mode
```bash
npm run test:e2e:debug
```

### View in UI Mode
```bash
npm run test:e2e:ui
```

### Take Screenshots
```typescript
await robot.screenshot("debug/state.png");
```

### Use Headed Mode
```bash
npm run test:e2e:headed
```

## 📚 File Checklist

- ✅ `pages/base.page.ts` - Base class
- ✅ `pages/toy-robot.page.ts` - Main page object with switch case
- ✅ `pages/locators.ts` - Centralized locators
- ✅ `specs/placement.spec.ts` - Placement tests
- ✅ `specs/movement.spec.ts` - Movement tests
- ✅ `specs/boundaries.spec.ts` - Boundary tests
- ✅ `specs/commands.spec.ts` - Command tests
- ✅ `fixtures/test-data.ts` - Test data
- ✅ `config/credentials.ts` - Configuration
- ✅ `utils/env.utils.ts` - Environment utilities
- ✅ `.env.example` - Environment template
- ✅ `.gitignore` - Git ignore rules
- ✅ `README.md` - Full documentation
- ✅ `package.json` - Dependencies updated

**Total Files Created: 14 ✅**
**Total Tests: 35 ✅**
**Tests Passing: 35/35 ✅**

---

For detailed information, see [README.md](README.md) and [POM_SETUP_GUIDE.md](../../POM_SETUP_GUIDE.md)
