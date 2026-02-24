import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * 
 * This configuration demonstrates enterprise-grade test setup:
 * - Runs tests in multiple browsers (Chromium, Firefox, WebKit)
 * - Generates HTML reports and traces for debugging
 * - Uses reasonable timeouts and retry logic
 * - Configures parallel execution for fast feedback
 */

export default defineConfig({
  testDir: './tests',
  
  /**
   * Test execution configuration
   */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  /**
   * Reporter configuration
   * - HTML report for visual inspection
   * - JUnit for CI/CD integration
   * - Trace for debugging failed tests
   */
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  /**
   * Global test timeout and expect timeout
   */
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5000, // 5 seconds for assertions
  },

  /**
   * Global setup and teardown
   */
  use: {
    /**
     * Base URL - replace with your staging environment
     */
    baseURL: process.env.BASE_URL || 'https://app.example.com',

    /**
     * Trace recording for debugging
     * Records traces for failed tests
     */
    trace: 'on-first-retry',

    /**
     * Screenshot on failure
     */
    screenshot: 'only-on-failure',

    /**
     * Video on failure
     */
    video: 'retain-on-failure',
  },

  /**
   * Project configuration - run tests in multiple browsers
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /**
   * Web server configuration (optional)
   * Uncomment and configure if you need to start a dev server before tests
   */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
