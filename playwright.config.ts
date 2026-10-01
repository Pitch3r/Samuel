import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;
// Use a preinstalled Chromium when available (e.g. CI images); otherwise run `npx playwright install chromium`.
const executablePath = process.env.PW_CHROMIUM_PATH ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /pages\.spec\.ts/ },
    // The narrowest phones still in use: every page must fit without sideways scrolling.
    {
      name: "small-phone",
      use: { ...devices["Pixel 7"], viewport: { width: 320, height: 640 } },
      testMatch: /pages\.spec\.ts/,
      grep: /renders cleanly/,
    },
  ],
  webServer: {
    command: `rm -rf .e2e-data && npm run build && npx next start -p ${port}`,
    url: `${baseURL}/api/health`,
    timeout: 600_000,
    reuseExistingServer: false,
    stdout: "pipe",
    env: {
      DATABASE_URL: "file:./.e2e-data/e2e.db",
      NEXT_PUBLIC_SITE_URL: baseURL,
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD: "e2e-password-123",
      SESSION_SECRET: "e2e-session-secret-that-is-long-enough-1234567890",
      FORM_MIN_FILL_MS: "0",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
