import { defineConfig, devices } from '@playwright/test';

// Registry port: override with E2E_PORT when 3000 is taken (registry.js reads the same var).
const port = Number(process.env.E2E_PORT || 3000);
const baseURL = `http://127.0.0.1:${port}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Per-test timeout: preview render + one action round-trip should take seconds. */
  timeout: 120 * 1000,
  expect: {
    /* Auto-retry assertions long enough for dev-server compile + hydration. */
    timeout: 30 * 1000,
    toHaveScreenshot: {
      /* Font antialiasing differs across machines/browsers; 2% absorbs it
         while still catching missing styles, broken layout, or empty renders. */
      maxDiffPixelRatio: 0.02,
    },
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['list'], ['html']] : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* No CSS animations in the templates, but disable them anyway so
       screenshots are deterministic. */
    animations: 'disabled',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Escape hatch for environments where downloading Playwright's
        // bundled browser is impossible; CI uses the default pinned browser.
        ...(process.env.CHROMIUM_EXECUTABLE_PATH
          ? {
              launchOptions: {
                executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
              },
            }
          : {}),
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // First run installs + compiles up to 7 components; allow generous startup.
    timeout: 900 * 1000,
    env: {
      E2E_PORT: String(port),
    },
  },
});
